import type { Absence } from "@/types/domain";
import { absenceConfig } from "@/lib/config/model-config";

/**
 * Foreløbig Fraværsscore. Bruges KUN som forklaring i UI (§12) –
 * absenceConfig.affectsMatchProbability er false, indtil effekten er
 * valideret mod historiske data.
 */
export function computeAbsenceScore(teamAbsences: Absence[]): {
  score: number; // 0-100, jo højere jo mere presset trup
  affectsMatchProbability: boolean;
} {
  if (teamAbsences.length === 0) {
    return { score: 0, affectsMatchProbability: absenceConfig.affectsMatchProbability };
  }

  const relevant = teamAbsences.filter(
    (a) => a.status !== "fully-available"
  );

  const weightedImpact = relevant.reduce((sum, a) => {
    return sum + a.playerImportance * a.expectedMinuteShare;
  }, 0);

  // Normaliseret til 0-100 med et blødt loft, så mange samtidige fravær
  // ikke giver et urealistisk ekstremt tal.
  const score = Math.round(Math.min(100, weightedImpact * 40));

  return { score, affectsMatchProbability: absenceConfig.affectsMatchProbability };
}
