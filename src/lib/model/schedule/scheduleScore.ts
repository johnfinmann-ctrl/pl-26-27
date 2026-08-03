import type { Fixture, ScheduleWindow, Team } from "@/types/domain";
import { scheduleScoreConfig, MODEL_VERSION_ID } from "@/lib/config/model-config";

interface RawDifficulty {
  teamId: string;
  window: ScheduleWindow;
  rawSum: number; // sum af modstanderstyrke, hjemme/ude-vægtet
  matchCount: number;
}

/**
 * Beregner rå programsværhed for et hold i et givet vindue baseret KUN på:
 * modstanderens styrke, hjemme/ude og (fremtidigt) bekræftet hviletid/pokalkamp.
 * Ingen subjektiv motivationseffekt, ingen vilkårlige bonusser (§10).
 */
function windowFixtures(
  teamId: string,
  allFixtures: Fixture[],
  window: ScheduleWindow,
  currentRound: number
): Fixture[] {
  const teamFixtures = allFixtures
    .filter((f) => f.homeTeamId === teamId || f.awayTeamId === teamId)
    .sort((a, b) => a.round - b.round);

  const upcoming = teamFixtures.filter((f) => f.round >= currentRound);
  const past = teamFixtures.filter((f) => f.round < currentRound);

  switch (window) {
    case "next5":
      return upcoming.slice(0, scheduleScoreConfig.windows.next5);
    case "next10":
      return upcoming.slice(0, scheduleScoreConfig.windows.next10);
    case "last10":
      return past.slice(-scheduleScoreConfig.windows.last10);
    case "last5":
      return past.slice(-scheduleScoreConfig.windows.last5);
    case "christmas":
      // Illustrativt: runder 17-20 antages at dække juleperioden i det
      // syntetiske kampprogram (§10 – ikke officielle datoer).
      return teamFixtures.filter((f) => f.round >= 17 && f.round <= 20);
    case "season":
      return teamFixtures;
  }
}

function opponentStrengthFor(f: Fixture, teamId: string, eloByTeam: Map<string, number>) {
  const isHome = f.homeTeamId === teamId;
  const opponentId = isHome ? f.awayTeamId : f.homeTeamId;
  const opponentElo = eloByTeam.get(opponentId) ?? 1500;
  // Hjemmekampe er lidt lettere at score point i, ude lidt sværere –
  // reflekteret som et fast, gennemsigtigt tillæg, ikke en vilkårlig bonus.
  const venueAdjustment = isHome ? -30 : 30;
  return opponentElo + venueAdjustment;
}

export function computeRawDifficulty(
  team: Team,
  allFixtures: Fixture[],
  window: ScheduleWindow,
  currentRound: number,
  eloByTeam: Map<string, number>
): RawDifficulty {
  const fixtures = windowFixtures(team.id, allFixtures, window, currentRound);
  const rawSum = fixtures.reduce(
    (sum, f) => sum + opponentStrengthFor(f, team.id, eloByTeam),
    0
  );
  return { teamId: team.id, window, rawSum, matchCount: fixtures.length };
}

function categoryFor(score: number): "easier" | "medium" | "harder" {
  if (score <= scheduleScoreConfig.thresholds.easierMax) return "easier";
  if (score <= scheduleScoreConfig.thresholds.mediumMax) return "medium";
  return "harder";
}

/**
 * Normaliserer rå programsværhed relativt mellem alle 20 hold til 0-100
 * (§10: "Normalisér resultatet relativt mellem de 20 hold").
 */
export function computeScheduleScores(
  teams: Team[],
  allFixtures: Fixture[],
  window: ScheduleWindow,
  currentRound: number,
  eloByTeam: Map<string, number>
) {
  const raw = teams.map((t) =>
    computeRawDifficulty(t, allFixtures, window, currentRound, eloByTeam)
  );

  const averages = raw.map((r) => (r.matchCount > 0 ? r.rawSum / r.matchCount : 0));
  const min = Math.min(...averages);
  const max = Math.max(...averages);
  const range = max - min || 1;

  const now = new Date().toISOString();

  return raw.map((r, i) => {
    const normalized = ((averages[i] - min) / range) * 100;
    const score = Math.round(normalized);
    return {
      teamId: r.teamId,
      window,
      score,
      category: categoryFor(score),
      explanation:
        "Score er relativ mellem de 20 hold og afhænger af de tilgængelige data om modstanderstyrke og hjemme/ude-fordeling.",
      internalId: `${r.teamId}-${window}`,
      source: "demo" as const,
      lastUpdated: now,
      dataQuality: "unverified" as const,
      verificationStatus: "unverified" as const,
      modelVersionId: MODEL_VERSION_ID,
    };
  });
}
