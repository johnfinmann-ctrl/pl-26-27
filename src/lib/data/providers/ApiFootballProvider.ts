import "server-only";
import type { DataProvider, LeagueSnapshot } from "@/lib/data/DataProvider";

/**
 * Server-side adapter til API-Football (§7). MÅ KUN bruges i server-context
 * (route handlers / server components) - "server-only" importen fejler
 * bevidst hvis modulet ved et uheld importeres i klientkode.
 *
 * API_FOOTBALL_KEY:
 * - læses kun her, server-side
 * - sendes ALDRIG til browseren
 * - logges ALDRIG
 * - indgår ALDRIG i fejlmeddelelser eller screenshots
 *
 * Denne V1-implementering er en forberedt, men ikke aktiveret, adapter.
 * Den er IKKE aktivt integreret i demoen og laver ingen scraping af
 * Premier Leagues hjemmeside.
 */
export class ApiFootballProvider implements DataProvider {
  readonly name = "api-football";

  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.API_FOOTBALL_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async load(): Promise<LeagueSnapshot> {
    if (!this.apiKey) {
      // Ingen nøgle => tomt snapshot; kaldende kode skal falde tilbage til
      // DemoDataProvider (se selectDataProvider).
      return {
        season: "ukendt",
        teams: [],
        players: [],
        fixtures: [],
        results: [],
        absences: [],
        cardEvents: [],
        worldCupLoads: [],
        status: "error",
        lastUpdated: new Date().toISOString(),
        errorMessage: "API_FOOTBALL_KEY mangler. Bruger demo-data i stedet.",
      };
    }

    // V1: Ikke implementeret endnu. Dette er stubben, der forberedes til V2,
    // så beregningsmotoren ikke skal ændres, når rigtig data kobles på.
    throw new Error(
      "ApiFootballProvider er forberedt til fremtidig brug, men er ikke aktiveret i V1."
    );
  }
}
