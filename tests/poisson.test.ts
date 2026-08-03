import { describe, it, expect } from "vitest";
import {
  expectedGoalsFromElo,
  scorelineDistribution,
} from "@/lib/model/goals/poisson";

describe("Poisson-målmodel", () => {
  it("alle sandsynligheder i resultatmatrixen er mellem 0 og 1", () => {
    const { expectedHomeGoals, expectedAwayGoals } = expectedGoalsFromElo(1600, 1400);
    const dist = scorelineDistribution(expectedHomeGoals, expectedAwayGoals);
    for (const row of dist.matrix) {
      for (const p of row) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(1);
      }
    }
  });

  it("H + X + U summerer til 1 inden for tolerance", () => {
    const { expectedHomeGoals, expectedAwayGoals } = expectedGoalsFromElo(1550, 1480);
    const dist = scorelineDistribution(expectedHomeGoals, expectedAwayGoals);
    const sum = dist.homeWin + dist.draw + dist.awayWin;
    expect(sum).toBeCloseTo(1, 6);
  });

  it("resultatmatrixen summerer til ca. 1", () => {
    const { expectedHomeGoals, expectedAwayGoals } = expectedGoalsFromElo(1500, 1500);
    const dist = scorelineDistribution(expectedHomeGoals, expectedAwayGoals);
    const total = dist.matrix.flat().reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 2);
  });

  it("stærkere hold får ikke lavere forventede mål end svagere hold uden forklaring", () => {
    const strongHome = expectedGoalsFromElo(1700, 1400);
    expect(strongHome.expectedHomeGoals).toBeGreaterThan(strongHome.expectedAwayGoals);

    const strongAway = expectedGoalsFromElo(1400, 1700);
    expect(strongAway.expectedAwayGoals).toBeGreaterThan(strongAway.expectedHomeGoals);
  });

  it("finder det mest sandsynlige resultat med en gyldig sandsynlighed", () => {
    const { expectedHomeGoals, expectedAwayGoals } = expectedGoalsFromElo(1520, 1490);
    const dist = scorelineDistribution(expectedHomeGoals, expectedAwayGoals);
    expect(dist.mostLikelyScoreline.probability).toBeGreaterThan(0);
    expect(dist.mostLikelyScoreline.home).toBeGreaterThanOrEqual(0);
    expect(dist.mostLikelyScoreline.away).toBeGreaterThanOrEqual(0);
  });
});
