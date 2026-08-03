import { describe, it, expect } from "vitest";
import { updateElo, expectedScore, startingRatingFor } from "@/lib/model/elo/elo";

describe("Elo-motor", () => {
  it("hjemmeholdets rating stiger efter en sejr", () => {
    const result = updateElo({
      homeElo: 1500,
      awayElo: 1500,
      homeGoals: 2,
      awayGoals: 0,
    });
    expect(result.newHomeElo).toBeGreaterThan(1500);
    expect(result.newAwayElo).toBeLessThan(1500);
  });

  it("ratingen er uændret ved uafgjort mellem lige stærke hold minus hjemmebanefordel-effekt", () => {
    const result = updateElo({
      homeElo: 1500,
      awayElo: 1500,
      homeGoals: 1,
      awayGoals: 1,
    });
    // Hjemmeholdet forventedes at vinde (pga. hjemmebanefordel), så uafgjort
    // trækker hjemmeholdets rating en anelse ned, udeholdets en anelse op.
    expect(result.newHomeElo).toBeLessThan(1500);
    expect(result.newAwayElo).toBeGreaterThan(1500);
  });

  it("hjemmeholdets rating falder efter et nederlag", () => {
    const result = updateElo({
      homeElo: 1500,
      awayElo: 1500,
      homeGoals: 0,
      awayGoals: 2,
    });
    expect(result.newHomeElo).toBeLessThan(1500);
    expect(result.newAwayElo).toBeGreaterThan(1500);
  });

  it("hjemmebanefordel anvendes én gang i expectedScore-beregningen", () => {
    // Med lige ratings skal hjemmeholdets forventede score være > 0.5
    const result = updateElo({
      homeElo: 1500,
      awayElo: 1500,
      homeGoals: 0,
      awayGoals: 0,
    });
    expect(result.homeExpectedScore).toBeGreaterThan(0.5);
  });

  it("expectedScore returnerer værdi mellem 0 og 1", () => {
    expect(expectedScore(1600, 1400)).toBeGreaterThan(0.5);
    expect(expectedScore(1600, 1400)).toBeLessThanOrEqual(1);
    expect(expectedScore(1400, 1600)).toBeGreaterThanOrEqual(0);
  });

  it("oprykkere starter med lavere rating end etablerede hold", () => {
    expect(startingRatingFor(true)).toBeLessThan(startingRatingFor(false));
  });
});
