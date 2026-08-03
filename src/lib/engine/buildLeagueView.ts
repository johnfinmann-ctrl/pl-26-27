import type { LeagueSnapshot } from "@/lib/data/DataProvider";
import { startingRatingFor } from "@/lib/model/elo/elo";
import {
  expectedGoalsFromElo,
  scorelineDistribution,
} from "@/lib/model/goals/poisson";
import { simulateSeason } from "@/lib/model/simulation/simulateSeason";
import { simulationConfig } from "@/lib/config/model-config";
import { computeScheduleScores } from "@/lib/model/schedule/scheduleScore";
import { computeFatigueScore } from "@/lib/model/fatigue/fatigueScore";
import { computeTeamWorldCupLoad } from "@/lib/model/fatigue/worldCupLoad";
import { computeAbsenceScore } from "@/lib/model/absence/absenceScore";
import type { MatchProbability, ScheduleWindow, TeamSeasonOutcome } from "@/types/domain";

export interface LeagueView {
  snapshot: LeagueSnapshot;
  eloByTeam: Map<string, number>;
  currentRound: number;
  nextRoundProbabilities: MatchProbability[];
  seasonSimulation: TeamSeasonOutcome[];
  scheduleScores: Record<ScheduleWindow, ReturnType<typeof computeScheduleScores>>;
  fatigueByTeam: Map<string, ReturnType<typeof computeFatigueScore>>;
  worldCupLoadByTeam: Map<string, { teamScore: number; label: string }>;
  absenceScoreByTeam: Map<string, { score: number; affectsMatchProbability: boolean }>;
}

const WINDOWS: ScheduleWindow[] = [
  "next5",
  "next10",
  "christmas",
  "last10",
  "last5",
  "season",
];

/**
 * Bygger den samlede visningsmodel til UI ud fra et data-snapshot. Denne
 * funktion er ren TypeScript og kan køre både i browseren og server-side.
 */
export function buildLeagueView(
  snapshot: LeagueSnapshot,
  options: { numberOfSimulations?: number; seed?: number | null } = {}
): LeagueView {
  const { teams, fixtures, players, absences, worldCupLoads } = snapshot;

  const eloByTeam = new Map(
    teams.map((t) => [t.id, startingRatingFor(t.isPromoted)])
  );

  const currentRound = 1; // I V1 er ingen kampe spillet endnu i demoen.

  const nextRoundFixtures = fixtures.filter((f) => f.round === currentRound);
  const nextRoundProbabilities: MatchProbability[] = nextRoundFixtures.map((f) => {
    const homeElo = eloByTeam.get(f.homeTeamId) ?? 1500;
    const awayElo = eloByTeam.get(f.awayTeamId) ?? 1500;
    const { expectedHomeGoals, expectedAwayGoals } = expectedGoalsFromElo(
      homeElo,
      awayElo
    );
    const dist = scorelineDistribution(expectedHomeGoals, expectedAwayGoals);
    return {
      fixtureId: f.id,
      homeWin: dist.homeWin,
      draw: dist.draw,
      awayWin: dist.awayWin,
      expectedHomeGoals,
      expectedAwayGoals,
      mostLikelyScoreline: dist.mostLikelyScoreline,
      scorelineMatrix: dist.matrix,
      modelVersionId: "demo-v1",
    };
  });

  const simulation = simulateSeason({
    teams,
    allFixtures: fixtures,
    playedResults: new Map(),
    eloByTeam,
    numberOfSimulations:
      options.numberOfSimulations ?? simulationConfig.interactiveSimulations,
    seed: options.seed ?? null,
  });

  const scheduleScores = Object.fromEntries(
    WINDOWS.map((w) => [
      w,
      computeScheduleScores(teams, fixtures, w, currentRound, eloByTeam),
    ])
  ) as Record<ScheduleWindow, ReturnType<typeof computeScheduleScores>>;

  const fatigueByTeam = new Map(
    teams.map((t) => [t.id, computeFatigueScore(t.id, fixtures, currentRound, 0)])
  );

  const worldCupLoadByTeam = new Map(
    teams.map((t) => [
      t.id,
      computeTeamWorldCupLoad(worldCupLoads.filter((w) => w.teamId === t.id)),
    ])
  );

  const absenceScoreByTeam = new Map(
    teams.map((t) => [
      t.id,
      computeAbsenceScore(absences.filter((a) => a.teamId === t.id)),
    ])
  );

  void players;

  return {
    snapshot,
    eloByTeam,
    currentRound,
    nextRoundProbabilities,
    seasonSimulation: simulation.outcomes,
    scheduleScores,
    fatigueByTeam,
    worldCupLoadByTeam,
    absenceScoreByTeam,
  };
}
