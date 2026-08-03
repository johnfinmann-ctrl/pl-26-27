import type { Fixture, Team } from "@/types/domain";

export interface ValidationIssue {
  code: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

const EXPECTED_TEAM_COUNT = 20;
const EXPECTED_TOTAL_MATCHES = 380; // kun håndhævet strengt for produktionsdata
const EXPECTED_MATCHES_PER_TEAM = 38;
const EXPECTED_HOME_MATCHES_PER_TEAM = 19;
const EXPECTED_AWAY_MATCHES_PER_TEAM = 19;

/**
 * Validerer holdlisten: præcis 20 hold, ingen dubletter.
 */
export function validateTeams(teams: Team[]): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (teams.length !== EXPECTED_TEAM_COUNT) {
    issues.push({
      code: "TEAM_COUNT_INVALID",
      message: `Forventede præcis ${EXPECTED_TEAM_COUNT} hold, fandt ${teams.length}.`,
    });
  }

  const seen = new Set<string>();
  for (const t of teams) {
    if (seen.has(t.id)) {
      issues.push({
        code: "DUPLICATE_TEAM",
        message: `Holdet "${t.id}" findes to gange.`,
      });
    }
    seen.add(t.id);
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Validerer kampprogrammet mod en kendt holdliste og, valgfrit, mod de
 * strenge produktionsregler (380 kampe, 19H/19U pr. hold).
 */
export function validateFixtures(
  fixtures: Fixture[],
  teams: Team[],
  options: { enforceProductionRules: boolean } = { enforceProductionRules: false }
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const teamIds = new Set(teams.map((t) => t.id));

  for (const f of fixtures) {
    if (!teamIds.has(f.homeTeamId)) {
      issues.push({
        code: "UNKNOWN_TEAM",
        message: `Ukendt hjemmehold "${f.homeTeamId}" i kamp ${f.id}.`,
      });
    }
    if (!teamIds.has(f.awayTeamId)) {
      issues.push({
        code: "UNKNOWN_TEAM",
        message: `Ukendt udehold "${f.awayTeamId}" i kamp ${f.id}.`,
      });
    }
    if (f.homeTeamId === f.awayTeamId) {
      issues.push({
        code: "TEAM_PLAYS_ITSELF",
        message: `Holdet "${f.homeTeamId}" møder sig selv i kamp ${f.id}.`,
      });
    }
  }

  if (options.enforceProductionRules) {
    if (fixtures.length !== EXPECTED_TOTAL_MATCHES) {
      issues.push({
        code: "TOTAL_MATCH_COUNT_INVALID",
        message: `Forventede præcis ${EXPECTED_TOTAL_MATCHES} ligakampe i produktionsdata, fandt ${fixtures.length}.`,
      });
    }

    const homeCounts = new Map<string, number>();
    const awayCounts = new Map<string, number>();
    for (const f of fixtures) {
      homeCounts.set(f.homeTeamId, (homeCounts.get(f.homeTeamId) ?? 0) + 1);
      awayCounts.set(f.awayTeamId, (awayCounts.get(f.awayTeamId) ?? 0) + 1);
    }

    for (const t of teams) {
      const home = homeCounts.get(t.id) ?? 0;
      const away = awayCounts.get(t.id) ?? 0;
      if (home !== EXPECTED_HOME_MATCHES_PER_TEAM || away !== EXPECTED_AWAY_MATCHES_PER_TEAM) {
        issues.push({
          code: "HOME_AWAY_COUNT_INVALID",
          message: `Holdet "${t.id}" har ${home} hjemmekampe og ${away} udekampe (forventede ${EXPECTED_HOME_MATCHES_PER_TEAM}/${EXPECTED_AWAY_MATCHES_PER_TEAM}).`,
        });
      }
      const total = home + away;
      if (total !== EXPECTED_MATCHES_PER_TEAM) {
        issues.push({
          code: "TEAM_MATCH_COUNT_INVALID",
          message: `Holdet "${t.id}" har ${total} kampe i alt (forventede ${EXPECTED_MATCHES_PER_TEAM}).`,
        });
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

export function validateLeagueData(
  teams: Team[],
  fixtures: Fixture[],
  options: { enforceProductionRules: boolean } = { enforceProductionRules: false }
): ValidationResult {
  const teamResult = validateTeams(teams);
  const fixtureResult = validateFixtures(fixtures, teams, options);
  return {
    valid: teamResult.valid && fixtureResult.valid,
    issues: [...teamResult.issues, ...fixtureResult.issues],
  };
}
