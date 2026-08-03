import { describe, it, expect } from "vitest";
import { DemoDataProvider } from "@/lib/data/demo/DemoDataProvider";
import { computeScheduleScores } from "@/lib/model/schedule/scheduleScore";
import { computeFatigueScore } from "@/lib/model/fatigue/fatigueScore";
import { computeTeamWorldCupLoad } from "@/lib/model/fatigue/worldCupLoad";
import { computeAbsenceScore } from "@/lib/model/absence/absenceScore";
import { startingRatingFor } from "@/lib/model/elo/elo";

describe("DemoDataProvider", () => {
  it("returnerer et gyldigt snapshot mærket som demo", async () => {
    const provider = new DemoDataProvider();
    const snapshot = await provider.load();
    expect(snapshot.status).toBe("demo");
    expect(snapshot.teams).toHaveLength(20);
    expect(snapshot.fixtures).toHaveLength(380);
    expect(snapshot.players.length).toBeGreaterThan(0);
  });
});

describe("computeScheduleScores", () => {
  it("normaliserer scoren til 0-100 relativt mellem holdene", async () => {
    const provider = new DemoDataProvider();
    const snapshot = await provider.load();
    const eloByTeam = new Map(
      snapshot.teams.map((t) => [t.id, startingRatingFor(t.isPromoted)])
    );
    const scores = computeScheduleScores(
      snapshot.teams,
      snapshot.fixtures,
      "next5",
      1,
      eloByTeam
    );
    expect(scores).toHaveLength(20);
    for (const s of scores) {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
      expect(["easier", "medium", "harder"]).toContain(s.category);
    }
  });
});

describe("computeFatigueScore", () => {
  it("returnerer en score mellem 0 og 100 uden at påvirke kampsandsynlighed", async () => {
    const provider = new DemoDataProvider();
    const snapshot = await provider.load();
    const teamId = snapshot.teams[0].id;
    const result = computeFatigueScore(teamId, snapshot.fixtures, 1, 1);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe("computeTeamWorldCupLoad", () => {
  it("er ikke en simpel sum og lander mellem 0-100", async () => {
    const provider = new DemoDataProvider();
    const snapshot = await provider.load();
    const teamId = snapshot.teams[0].id;
    const teamLoads = snapshot.worldCupLoads.filter((w) => w.teamId === teamId);
    const result = computeTeamWorldCupLoad(teamLoads);
    expect(result.teamScore).toBeGreaterThanOrEqual(0);
    expect(result.teamScore).toBeLessThanOrEqual(100);
    expect(result.label).toContain("Illustrativ");
  });
});

describe("computeAbsenceScore", () => {
  it("markerer at scoren ikke påvirker kampsandsynlighed i V1", async () => {
    const provider = new DemoDataProvider();
    const snapshot = await provider.load();
    const teamId = snapshot.absences[0]?.teamId;
    const teamAbsences = snapshot.absences.filter((a) => a.teamId === teamId);
    const result = computeAbsenceScore(teamAbsences);
    expect(result.affectsMatchProbability).toBe(false);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
