import type { Fixture } from "@/types/domain";
import { fatigueConfig, MODEL_VERSION_ID } from "@/lib/config/model-config";

/**
 * Illustrativ hvile/belastnings-score. Vises kun informativt i V1
 * (fatigueConfig.affectsMatchProbability === false) og påvirker IKKE
 * kampsandsynlighederne, jf. §11.
 */
export function computeFatigueScore(
  teamId: string,
  teamFixtures: Fixture[],
  currentRound: number,
  cupMatchesNearby: number
) {
  const sorted = teamFixtures
    .filter((f) => f.homeTeamId === teamId || f.awayTeamId === teamId)
    .sort((a, b) => a.round - b.round);

  const upcoming = sorted.filter((f) => f.round >= currentRound).slice(0, 5);
  const gaps: number[] = [];
  for (let i = 1; i < upcoming.length; i++) {
    // I demo-data uden faste datoer antages 7 dage pr. runde som baseline.
    gaps.push((upcoming[i].round - upcoming[i - 1].round) * 7);
  }
  const restDaysAverage =
    gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 7;

  // Score: lavere hviledage og flere pokalkampe i nærheden => højere belastning.
  const restComponent = Math.max(0, Math.min(100, (7 - restDaysAverage) * 20 + 50));
  const cupComponent = Math.min(30, cupMatchesNearby * 15);
  const score = Math.round(Math.max(0, Math.min(100, restComponent + cupComponent - 30)));

  return {
    teamId,
    asOf: new Date().toISOString(),
    restDaysAverage: Math.round(restDaysAverage * 10) / 10,
    cupMatchesNearby,
    score,
    internalId: `${teamId}-fatigue`,
    source: "demo" as const,
    lastUpdated: new Date().toISOString(),
    dataQuality: "unverified" as const,
    verificationStatus: "unverified" as const,
    active: fatigueConfig.active,
    modelVersionId: MODEL_VERSION_ID,
  };
}
