import type { DataProvider, LeagueSnapshot } from "@/lib/data/DataProvider";
import { DEMO_TEAMS, SEASON } from "@/lib/data/demo/clubs";
import { generateSyntheticFixtures } from "@/lib/data/demo/fixtures";
import {
  generateDemoAbsences,
  generateDemoCardEvents,
  generateDemoPlayers,
  generateDemoWorldCupLoads,
} from "@/lib/data/demo/playersAndAbsences";
import { validateLeagueData } from "@/lib/model/validation/leagueValidation";

/**
 * Standardleverandøren i V1. Kræver ingen API-nøgle og fungerer altid,
 * jf. §6/§7: "Hvis nøglen mangler, skal appen automatisk bruge
 * DemoDataProvider."
 */
export class DemoDataProvider implements DataProvider {
  readonly name = "demo";

  async load(): Promise<LeagueSnapshot> {
    const teams = DEMO_TEAMS;
    const fixtures = generateSyntheticFixtures(teams);

    const validation = validateLeagueData(teams, fixtures, {
      enforceProductionRules: true,
    });
    if (!validation.valid) {
      return {
        season: SEASON,
        teams,
        players: [],
        fixtures: [],
        results: [],
        absences: [],
        cardEvents: [],
        worldCupLoads: [],
        status: "error",
        lastUpdated: new Date().toISOString(),
        errorMessage: validation.issues.map((i) => i.message).join(" "),
      };
    }

    const players = generateDemoPlayers(teams);
    const absences = generateDemoAbsences(players);
    const cardEvents = generateDemoCardEvents(players);
    const worldCupLoads = generateDemoWorldCupLoads(players);

    return {
      season: SEASON,
      teams,
      players,
      fixtures,
      results: [],
      absences,
      cardEvents,
      worldCupLoads,
      status: "demo",
      lastUpdated: new Date().toISOString(),
    };
  }
}
