import type { LeagueSnapshot } from "@/lib/data/DataProvider";
import { startingRatingFor } from "@/lib/model/elo/elo";
import {
  expectedGoalsFromElo,
  scorelineDistribution,
} from "@/lib/model/goals/poisson";
import {
  simulateSeason,
  type SimulateSeasonInput,
} from "@/lib/model/simulation/simulateSeason";
import { simulationConfig } from "@/lib/config/model-config";
import { computeScheduleScores } from "@/lib/model/schedule/scheduleScore";
import { computeFatigueScore } from "@/lib/model/fatigue/fatigueScore";
import { computeTeamWorldCupLoad } from "@/lib/model/fatigue/worldCupLoad";
import { computeAbsenceScore } from "@/lib/model/absence/absenceScore";
import type {
  MatchProbability,
  ScheduleWindow,
  TeamSeasonOutcome,
} from "@/types/domain";

export interface LeagueViewBase {
  snapshot: LeagueSnapshot;
  eloByTeam: Map<string, number>;
  currentRound: number;
  nextRoundProbabilities: MatchProbability[];
  scheduleScores: Record<ScheduleWindow, ReturnType<typeof computeScheduleScores>>;
  fatigueByTeam: Map<string, ReturnType<typeof computeFatigueScore>>;
  worldCupLoadByTeam: Map<string, { teamScore: number; label: string }>;
  absenceScoreByTeam: Map<string, { score: number; affectsMatchProbability: boolean }>;
}

export interface LeagueView extends LeagueViewBase {
  seasonSimulation: TeamSeasonOutcome[];
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
 * Bygger alle de HURTIGE dele af visningsmodellen (Elo-udgangspunkter,
 * næste rundes 1-X-2-sandsynligheder, programscore, hvile-/VM-/fraværs-
 * score). Indeholder bevidst IKKE Monte Carlo-sæsonsimuleringen (§9), som
 * er den tunge beregning og derfor køres separat - typisk i en Web Worker
 * (se src/lib/simulation/useSimulationRunner.ts) - så UI'et kan vise
 * resten af siden, mens simuleringen kører i baggrunden.
 */
export function buildLeagueViewBase(snapshot: LeagueSnapshot): LeagueViewBase {
  const { teams, fixtures, absences, worldCupLoads } = snapshot;

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

  return {
    snapshot,
    eloByTeam,
    currentRound,
    nextRoundProbabilities,
    scheduleScores,
    fatigueByTeam,
    worldCupLoadByTeam,
    absenceScoreByTeam,
  };
}

/**
 * Bygger input til simulateSeason (og dermed til Web Worker'en) ud fra en
 * allerede-beregnet LeagueViewBase.
 */
export function buildSimulationInput(
  base: LeagueViewBase,
  options: { numberOfSimulations?: number; seed?: number | null } = {}
): SimulateSeasonInput {
  return {
    teams: base.snapshot.teams,
    allFixtures: base.snapshot.fixtures,
    playedResults: new Map(),
    eloByTeam: base.eloByTeam,
    numberOfSimulations:
      options.numberOfSimulations ?? simulationConfig.interactiveSimulations,
    seed: options.seed ?? null,
  };
}

/**
 * Bekvemmelighedsfunktion, der bygger HELE visningsmodellen synkront,
 * inklusive sæsonsimuleringen på samme tråd. Bruges i tests, CLI-scripts
 * og som fallback uden for browserkontekst. UI'et i browseren bør i
 * stedet bruge buildLeagueViewBase + useSimulationRunner, så simuleringen
 * ikke blokerer hovedtråden.
 */
export function buildLeagueView(
  snapshot: LeagueSnapshot,
  options: { numberOfSimulations?: number; seed?: number | null } = {}
): LeagueView {
  const base = buildLeagueViewBase(snapshot);
  const simulation = simulateSeason(buildSimulationInput(base, options));

  return {
    ...base,
    seasonSimulation: simulation.outcomes,
  };
}
