import { describe, it, expect } from "vitest";
import { DEMO_TEAMS } from "@/lib/data/demo/clubs";
import { generateSyntheticFixtures } from "@/lib/data/demo/fixtures";
import {
  validateTeams,
  validateFixtures,
  validateLeagueData,
} from "@/lib/model/validation/leagueValidation";
import type { Team } from "@/types/domain";

describe("validateTeams", () => {
  it("accepterer præcis 20 hold uden dubletter", () => {
    const result = validateTeams(DEMO_TEAMS);
    expect(result.valid).toBe(true);
    expect(DEMO_TEAMS.length).toBe(20);
  });

  it("fejler hvis der ikke er præcis 20 hold", () => {
    const result = validateTeams(DEMO_TEAMS.slice(0, 19));
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "TEAM_COUNT_INVALID")).toBe(true);
  });

  it("fejler hvis et hold findes to gange", () => {
    const duplicated: Team[] = [...DEMO_TEAMS, DEMO_TEAMS[0]];
    const result = validateTeams(duplicated);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "DUPLICATE_TEAM")).toBe(true);
  });

  it("indeholder de tre korrekte oprykkere", () => {
    const promoted = DEMO_TEAMS.filter((t) => t.isPromoted).map((t) => t.id).sort();
    expect(promoted).toEqual(["coventry-city", "hull-city", "ipswich-town"]);
  });
});

describe("validateFixtures", () => {
  const fixtures = generateSyntheticFixtures(DEMO_TEAMS);

  it("genererer 380 kampe for 20 hold i produktionsreglerne", () => {
    const result = validateFixtures(fixtures, DEMO_TEAMS, {
      enforceProductionRules: true,
    });
    expect(fixtures.length).toBe(380);
    expect(result.valid).toBe(true);
  });

  it("hvert hold har 19 hjemme- og 19 udekampe", () => {
    const result = validateFixtures(fixtures, DEMO_TEAMS, {
      enforceProductionRules: true,
    });
    expect(result.issues.filter((i) => i.code === "HOME_AWAY_COUNT_INVALID")).toHaveLength(0);
  });

  it("intet hold møder sig selv", () => {
    const selfPlay = fixtures.some((f) => f.homeTeamId === f.awayTeamId);
    expect(selfPlay).toBe(false);
  });

  it("fejler ved ukendt hold i kampprogrammet", () => {
    const withUnknown = [
      ...fixtures.slice(0, 1),
      {
        ...fixtures[0],
        id: "bad-fixture",
        homeTeamId: "unknown-team",
      },
    ];
    const result = validateFixtures(withUnknown, DEMO_TEAMS);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "UNKNOWN_TEAM")).toBe(true);
  });

  it("fejler hvis et hold møder sig selv", () => {
    const withSelfPlay = [
      { ...fixtures[0], id: "self-play", awayTeamId: fixtures[0].homeTeamId },
    ];
    const result = validateFixtures(withSelfPlay, DEMO_TEAMS);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "TEAM_PLAYS_ITSELF")).toBe(true);
  });
});

describe("validateLeagueData", () => {
  it("samlet validering er gyldig for demo-datasættet", () => {
    const fixtures = generateSyntheticFixtures(DEMO_TEAMS);
    const result = validateLeagueData(DEMO_TEAMS, fixtures, {
      enforceProductionRules: true,
    });
    expect(result.valid).toBe(true);
  });
});
