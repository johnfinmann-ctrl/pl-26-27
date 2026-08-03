import type {
  Fixture,
  MatchResult,
  SeasonSimulation,
  Team,
  TeamSeasonOutcome,
} from "@/types/domain";
import { expectedGoalsFromElo } from "@/lib/model/goals/poisson";
import { createRng, samplePoisson } from "@/lib/model/simulation/rng";
import { simulationConfig, MODEL_VERSION_ID } from "@/lib/config/model-config";

interface TableRow {
  teamId: string;
  played: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  headToHeadPoints: Record<string, number>;
}

function emptyRow(teamId: string): TableRow {
  return {
    teamId,
    played: 0,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    headToHeadPoints: {},
  };
}

function applyResult(table: Map<string, TableRow>, m: MatchResult, f: Fixture) {
  const home = table.get(f.homeTeamId)!;
  const away = table.get(f.awayTeamId)!;

  home.played++;
  away.played++;
  home.goalsFor += m.homeGoals;
  home.goalsAgainst += m.awayGoals;
  away.goalsFor += m.awayGoals;
  away.goalsAgainst += m.homeGoals;

  if (m.homeGoals > m.awayGoals) {
    home.points += 3;
    home.headToHeadPoints[f.awayTeamId] = (home.headToHeadPoints[f.awayTeamId] ?? 0) + 3;
  } else if (m.homeGoals < m.awayGoals) {
    away.points += 3;
    away.headToHeadPoints[f.homeTeamId] = (away.headToHeadPoints[f.homeTeamId] ?? 0) + 3;
  } else {
    home.points += 1;
    away.points += 1;
    home.headToHeadPoints[f.awayTeamId] = (home.headToHeadPoints[f.awayTeamId] ?? 0) + 1;
    away.headToHeadPoints[f.homeTeamId] = (away.headToHeadPoints[f.homeTeamId] ?? 0) + 1;
  }
}

function sortTable(rows: TableRow[]): TableRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    const h2hA = a.headToHeadPoints[b.teamId] ?? 0;
    const h2hB = b.headToHeadPoints[a.teamId] ?? 0;
    if (h2hB !== h2hA) return h2hB - h2hA;
    return a.teamId.localeCompare(b.teamId);
  });
}

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

export interface SimulateSeasonInput {
  teams: Team[];
  allFixtures: Fixture[];
  playedResults: Map<string, MatchResult>; // fixtureId -> result
  eloByTeam: Map<string, number>; // fastfrosset rating (§9)
  numberOfSimulations: number;
  seed: number | null;
  overrides?: Map<string, { homeGoals: number; awayGoals: number }>; // scenarie (§15)
}

export function simulateSeason(input: SimulateSeasonInput): SeasonSimulation {
  const {
    teams,
    allFixtures,
    playedResults,
    eloByTeam,
    numberOfSimulations,
    seed,
    overrides,
  } = input;

  const remainingFixtures = allFixtures.filter((f) => !playedResults.has(f.id));
  const finalPositionCounts = new Map<string, number[]>();
  const pointsCollected = new Map<string, number[]>();
  teams.forEach((t) => {
    finalPositionCounts.set(t.id, new Array(teams.length).fill(0));
    pointsCollected.set(t.id, []);
  });

  const rng = createRng(seed);

  for (let sim = 0; sim < numberOfSimulations; sim++) {
    const table = new Map<string, TableRow>();
    teams.forEach((t) => table.set(t.id, emptyRow(t.id)));

    // 1. Anvend allerede spillede resultater
    for (const f of allFixtures) {
      const played = playedResults.get(f.id);
      if (played) applyResult(table, played, f);
    }

    // 2. Simulér resterende kampe
    for (const f of remainingFixtures) {
      const override = overrides?.get(f.id);
      let homeGoals: number;
      let awayGoals: number;

      if (override) {
        homeGoals = override.homeGoals;
        awayGoals = override.awayGoals;
      } else {
        const homeElo = eloByTeam.get(f.homeTeamId) ?? 1500;
        const awayElo = eloByTeam.get(f.awayTeamId) ?? 1500;
        const { expectedHomeGoals, expectedAwayGoals } = expectedGoalsFromElo(
          homeElo,
          awayElo
        );
        homeGoals = samplePoisson(expectedHomeGoals, rng);
        awayGoals = samplePoisson(expectedAwayGoals, rng);
      }

      applyResult(table, { homeGoals, awayGoals } as MatchResult, f);
    }

    const sorted = sortTable(Array.from(table.values()));
    sorted.forEach((row, index) => {
      finalPositionCounts.get(row.teamId)![index]++;
      pointsCollected.get(row.teamId)!.push(row.points);
    });
  }

  const outcomes: TeamSeasonOutcome[] = teams.map((t) => {
    const points = pointsCollected.get(t.id)!.slice().sort((a, b) => a - b);
    const positions = finalPositionCounts.get(t.id)!;
    const mean = points.reduce((a, b) => a + b, 0) / points.length;
    const median = quantile(points, 0.5);
    const p10 = quantile(points, 0.1);
    const p90 = quantile(points, 0.9);
    const positionProbabilities = positions.map((c) => c / numberOfSimulations);

    const titleProbability = positionProbabilities[0] ?? 0;
    // Illustrativ europæisk grænse: top 6 (kan justeres senere uden at ændre motoren)
    const europeanProbability = positionProbabilities
      .slice(0, 6)
      .reduce((a, b) => a + b, 0);
    const relegationProbability = positionProbabilities
      .slice(-3)
      .reduce((a, b) => a + b, 0);

    return {
      teamId: t.id,
      meanPoints: Math.round(mean * 100) / 100,
      medianPoints: Math.round(median * 100) / 100,
      p10Points: Math.round(p10 * 100) / 100,
      p90Points: Math.round(p90 * 100) / 100,
      positionProbabilities,
      titleProbability,
      europeanProbability,
      relegationProbability,
    };
  });

  return {
    id: `sim-${Date.now()}`,
    season: teams.length > 0 ? "2026/27" : "",
    runAt: new Date().toISOString(),
    numberOfSimulations,
    seed,
    modelVersionId: MODEL_VERSION_ID,
    frozenRatings: simulationConfig.useFrozenRatings,
    outcomes,
  };
}
