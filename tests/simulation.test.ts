import { describe, it, expect } from "vitest";
import { DEMO_TEAMS } from "@/lib/data/demo/clubs";
import { generateSyntheticFixtures } from "@/lib/data/demo/fixtures";
import { simulateSeason } from "@/lib/model/simulation/simulateSeason";
import { startingRatingFor } from "@/lib/model/elo/elo";

function baseInput(numberOfSimulations: number, seed: number | null) {
  const fixtures = generateSyntheticFixtures(DEMO_TEAMS);
  const eloByTeam = new Map(
    DEMO_TEAMS.map((t) => [t.id, startingRatingFor(t.isPromoted)])
  );
  return {
    teams: DEMO_TEAMS,
    allFixtures: fixtures,
    playedResults: new Map(),
    eloByTeam,
    numberOfSimulations,
    seed,
  };
}

describe("simulateSeason", () => {
  it("er reproducerbar ved fast seed", () => {
    const inputA = baseInput(200, 42);
    const inputB = baseInput(200, 42);
    const resultA = simulateSeason(inputA);
    const resultB = simulateSeason(inputB);
    expect(resultA.outcomes).toEqual(resultB.outcomes);
  });

  it("tabellen indeholder alle 20 hold", () => {
    const result = simulateSeason(baseInput(100, 1));
    expect(result.outcomes).toHaveLength(20);
  });

  it("point og placeringssandsynligheder er gyldige, ingen NaN eller Infinity", () => {
    const result = simulateSeason(baseInput(150, 7));
    for (const outcome of result.outcomes) {
      expect(Number.isFinite(outcome.meanPoints)).toBe(true);
      expect(Number.isFinite(outcome.medianPoints)).toBe(true);
      expect(outcome.meanPoints).toBeGreaterThanOrEqual(0);
      expect(outcome.meanPoints).toBeLessThanOrEqual(114); // 38 kampe * 3 point
      for (const p of outcome.positionProbabilities) {
        expect(Number.isFinite(p)).toBe(true);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(1);
      }
    }
  });

  it("sandsynligheder for slutplacering summerer korrekt til ca. 1 for hvert hold", () => {
    const result = simulateSeason(baseInput(200, 3));
    for (const outcome of result.outcomes) {
      const sum = outcome.positionProbabilities.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 6);
    }
  });

  it("summen af sandsynligheden for at opnå hver plads er 1 på tværs af hold (hver plads besat af netop ét hold pr. simulering)", () => {
    const result = simulateSeason(baseInput(200, 9));
    const positionTotals = new Array(20).fill(0);
    for (const outcome of result.outcomes) {
      outcome.positionProbabilities.forEach((p, i) => (positionTotals[i] += p));
    }
    for (const total of positionTotals) {
      expect(total).toBeCloseTo(1, 6);
    }
  });

  it("scenarie (override) ændrer resultatet uden at overskrive basen", () => {
    const input = baseInput(100, 5);
    const fixture = input.allFixtures[input.allFixtures.length - 1];
    const overrides = new Map([
      [fixture.id, { homeGoals: 9, awayGoals: 0 }],
    ]);
    const baseResult = simulateSeason(input);
    const scenarioResult = simulateSeason({ ...input, overrides });

    // Basen (uden overrides) forbliver upåvirket, når vi kører den igen
    const baseResultAgain = simulateSeason(input);
    expect(baseResultAgain.outcomes).toEqual(baseResult.outcomes);

    // Scenariet giver et andet resultat for hjemmeholdet i den overstyrede kamp
    const teamOutcomeBase = baseResult.outcomes.find(
      (o) => o.teamId === fixture.homeTeamId
    )!;
    const teamOutcomeScenario = scenarioResult.outcomes.find(
      (o) => o.teamId === fixture.homeTeamId
    )!;
    expect(teamOutcomeScenario.meanPoints).not.toEqual(teamOutcomeBase.meanPoints);
  });
});
