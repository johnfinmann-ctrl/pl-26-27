import type { WorldCupLoad } from "@/types/domain";
import { worldCupLoadConfig } from "@/lib/config/model-config";

/**
 * Beregner et holds illustrative VM-belastning som et vægtet gennemsnit på
 * spillerniveau (ikke en simpel sum, der automatisk ender på 100), jf. §11.
 * Ingen fast effekt på forventede mål aktiveres – kun forklarende visning.
 */
export function computeTeamWorldCupLoad(playerLoads: WorldCupLoad[]): {
  teamScore: number; // 0-100, illustrativ
  label: string;
} {
  if (playerLoads.length === 0) {
    return { teamScore: 0, label: worldCupLoadConfig.illustrativeLabel };
  }

  let weightedSum = 0;
  let weightTotal = 0;

  for (const p of playerLoads) {
    // Belastningskomponent pr. spiller: minutter ved VM + rejse/tidszone +
    // færre træningsdage - erstatningskvalitet (dæmper effekten hvis holdet
    // har god dækning på pladsen).
    const minutesComponent = Math.min(1, p.minutesAtWorldCup / 450); // ~5 kampe
    const travelComponent = Math.min(1, Math.abs(p.travelTimezoneShift) / 10);
    const trainingLossComponent = Math.min(1, p.clubTrainingDaysMissed / 21);
    const replacementDampening = 1 - p.replacementQuality * 0.5;

    const playerLoadScore =
      (minutesComponent * 0.5 + travelComponent * 0.25 + trainingLossComponent * 0.25) *
      replacementDampening *
      100;

    const weight = p.expectedClubMinuteShare;
    weightedSum += playerLoadScore * weight;
    weightTotal += weight;
  }

  const teamScore = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;

  return {
    teamScore: Math.max(0, Math.min(100, teamScore)),
    label: worldCupLoadConfig.illustrativeLabel,
  };
}
