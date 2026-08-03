import { eloConfig } from "@/lib/config/model-config";

export interface EloMatchInput {
  homeElo: number;
  awayElo: number;
  homeGoals: number;
  awayGoals: number;
}

export interface EloUpdateResult {
  newHomeElo: number;
  newAwayElo: number;
  homeExpectedScore: number; // 0-1, IKKE en direkte vinderchance – se note
  awayExpectedScore: number;
}

/**
 * Elo-forventet score (0-1) er en klassisk Elo-konstruktion baseret på
 * ratingforskel + hjemmebanefordel. Den må IKKE forveksles med den
 * faktiske 1-X-2-sandsynlighed, som beregnes af Poisson-modellen
 * (se lib/model/goals). Elo-forventet score kender ikke til uafgjort.
 */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function actualScoreFromGoals(homeGoals: number, awayGoals: number): {
  home: number;
  away: number;
} {
  if (homeGoals > awayGoals) return { home: 1, away: 0 };
  if (homeGoals < awayGoals) return { home: 0, away: 1 };
  return { home: 0.5, away: 0.5 };
}

/**
 * Målmargin-multiplikator, dæmpet med et loft, så meget store sejre ikke
 * giver ubegrænset store ratingspring (§8: "målmargin").
 */
function goalMarginMultiplier(goalDifference: number): number {
  const raw = Math.log(Math.abs(goalDifference) + 1);
  return Math.min(raw, eloConfig.goalMarginMultiplierCap);
}

export function updateElo(input: EloMatchInput): EloUpdateResult {
  const homeRatingWithAdvantage = input.homeElo + eloConfig.homeAdvantage;
  const homeExpectedScore = expectedScore(homeRatingWithAdvantage, input.awayElo);
  const awayExpectedScore = 1 - homeExpectedScore;

  const actual = actualScoreFromGoals(input.homeGoals, input.awayGoals);
  const margin = goalMarginMultiplier(input.homeGoals - input.awayGoals);
  const k = eloConfig.kFactor * Math.max(margin, 1);

  const newHomeElo = input.homeElo + k * (actual.home - homeExpectedScore);
  const newAwayElo = input.awayElo + k * (actual.away - awayExpectedScore);

  return {
    newHomeElo: Math.round(newHomeElo * 100) / 100,
    newAwayElo: Math.round(newAwayElo * 100) / 100,
    homeExpectedScore,
    awayExpectedScore,
  };
}

/**
 * Regression mod middelværdi mellem sæsoner (§8).
 */
export function regressToMean(rating: number): number {
  const target = eloConfig.startRating;
  return rating + (target - rating) * eloConfig.regressionToMeanFactor;
}

export function startingRatingFor(isPromoted: boolean): number {
  return isPromoted ? eloConfig.promotedTeamStartRating : eloConfig.startRating;
}
