import type { Fixture, Team } from "@/types/domain";
import { SEASON } from "@/lib/data/demo/clubs";

/**
 * Genererer et syntetisk, tydeligt mærket testkampprogram med "circle method"
 * dobbelt-round-robin: 20 hold -> 19 runder enkelt-serie -> vendes for
 * returkampe -> 38 runder, 380 kampe, 19 hjemme + 19 ude pr. hold (§4, §6).
 *
 * Dette er IKKE det officielle 2026/27-kampprogram. Det er syntetiske
 * testdata til brug i demoen, jf. §6: "Opfind ikke officielle 2026/27-kampe."
 */
export function generateSyntheticFixtures(teams: Team[]): Fixture[] {
  if (teams.length !== 20) {
    throw new Error(
      `generateSyntheticFixtures kræver præcis 20 hold, fik ${teams.length}.`
    );
  }

  const ids = teams.map((t) => t.id);
  const n = ids.length;
  const rounds: { home: string; away: string }[][] = [];

  // Circle method: hold 0 er fast, resten roterer.
  const fixed = ids[0];
  let rotating = ids.slice(1);

  for (let round = 0; round < n - 1; round++) {
    const roundMatches: { home: string; away: string }[] = [];
    const current = [fixed, ...rotating];

    for (let i = 0; i < n / 2; i++) {
      const teamA = current[i];
      const teamB = current[n - 1 - i];
      // Alternér hjemme/ude pr. runde for rimelig balance
      if (round % 2 === 0) {
        roundMatches.push({ home: teamA, away: teamB });
      } else {
        roundMatches.push({ home: teamB, away: teamA });
      }
    }
    rounds.push(roundMatches);

    // roter
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)];
  }

  const now = new Date("2026-08-08T00:00:00.000Z");
  const fixtures: Fixture[] = [];
  let counter = 1;

  const pushRound = (
    roundMatches: { home: string; away: string }[],
    roundNumber: number,
    flip: boolean
  ) => {
    for (const m of roundMatches) {
      const home = flip ? m.away : m.home;
      const away = flip ? m.home : m.away;
      const kickoff = new Date(now);
      kickoff.setUTCDate(now.getUTCDate() + (roundNumber - 1) * 7);

      fixtures.push({
        id: `synthetic-r${roundNumber}-${counter}`,
        season: SEASON,
        round: roundNumber,
        homeTeamId: home,
        awayTeamId: away,
        kickoff: null,
        isDateTentative: true,
        status: "scheduled",
        internalId: `synthetic-r${roundNumber}-${counter}`,
        source: "demo",
        lastUpdated: "2026-07-01T00:00:00.000Z",
        dataQuality: "synthetic",
        verificationStatus: "not-applicable",
      });
      counter++;
    }
  };

  // Runde 1-19: enkelt-serie
  rounds.forEach((roundMatches, idx) => pushRound(roundMatches, idx + 1, false));
  // Runde 20-38: returkampe med byttet hjemme/ude
  rounds.forEach((roundMatches, idx) => pushRound(roundMatches, n - 1 + idx + 1, true));

  return fixtures;
}
