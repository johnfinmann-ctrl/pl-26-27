/**
 * Central modelkonfiguration.
 *
 * VIGTIGT: Alle startværdier og vægte herunder er FORELØBIGE og endnu ikke
 * backtestet mod historiske data. De ligger samlet ét sted, så de aldrig er
 * skjulte, hardcodede tal spredt i beregningsmotoren (§8).
 */

export const MODEL_VERSION_ID = "demo-v1";
export const APP_VERSION = "0.1.0-demo";

export const eloConfig = {
  modelVersionId: MODEL_VERSION_ID,
  startRating: 1500,
  homeAdvantage: 60, // Elo-point tillagt hjemmeholdet i forventningsberegningen
  kFactor: 20,
  goalMarginMultiplierCap: 1.75, // dæmper effekten af meget store målmarginer
  promotedTeamStartRating: 1380, // foreløbigt lavere udgangspunkt for oprykkere
  regressionToMeanFactor: 0.25, // andel af afstand til 1500 der udlignes mellem sæsoner
  backtested: false,
} as const;

export const poissonConfig = {
  modelVersionId: MODEL_VERSION_ID,
  maxGoalsExplicit: 7, // 0..7, "7+" samles i en hale
  homeAdvantageGoals: 0.25, // tillæg til forventede hjemmemål, foreløbigt
  leagueAverageGoalsPerTeam: 1.35, // foreløbigt syntetisk baseline i demo
  backtested: false,
} as const;

export const simulationConfig = {
  modelVersionId: MODEL_VERSION_ID,
  interactiveSimulations: 10_000,
  serverBatchSimulations: 50_000,
  defaultSeedForTests: 42,
  useFrozenRatings: true, // dynamisk Elo er IKKE aktiveret som standard
  tiebreakOrder: [
    "points",
    "goalDifference",
    "goalsFor",
    "headToHeadPoints",
  ] as const,
} as const;

export const scheduleScoreConfig = {
  modelVersionId: MODEL_VERSION_ID,
  windows: {
    next5: 5,
    next10: 10,
    last10: 10,
    last5: 5,
  },
  // Ingen vilkårlige bonusser (+50/-20). Normaliseres relativt mellem 20 hold.
  thresholds: {
    easierMax: 33,
    mediumMax: 66,
  },
  useMotivationEffect: false, // eksplicit slået fra i V1
} as const;

export const fatigueConfig = {
  modelVersionId: MODEL_VERSION_ID,
  active: true,
  affectsMatchProbability: false, // vises kun informativt i V1
} as const;

export const worldCupLoadConfig = {
  modelVersionId: MODEL_VERSION_ID,
  active: true,
  affectsMatchProbability: false, // ingen fast effekt før backtesting (§11)
  illustrativeLabel: "Illustrativ belastningsscore – endnu ikke valideret.",
} as const;

export const absenceConfig = {
  modelVersionId: MODEL_VERSION_ID,
  affectsMatchProbability: false, // kun forklarende i V1, medmindre valideret
} as const;

export const dataStatusLabels = {
  demo: "Demo",
  imported: "Importeret",
  "api-updated": "API-opdateret",
  stale: "Forældet",
  error: "Fejl",
  "partially-verified": "Delvist verificeret",
} as const;
