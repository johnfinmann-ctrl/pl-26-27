import "server-only";
import type { DataProvider, LeagueSnapshot } from "@/lib/data/DataProvider";

/**
 * Server-side adapter til API-Football (§7). MÅ KUN bruges i server-context
 * (route handlers / server components) - "server-only" importen fejler
 * bevidst hvis modulet ved et uheld importeres i klientkode.
 *
 * API_FOOTBALL_KEY:
 * - læses kun her, server-side
 * - sendes ALDRIG til browseren (aldrig gennem NEXT_PUBLIC_*)
 * - logges ALDRIG
 * - indgår ALDRIG i fejlmeddelelser eller screenshots
 *
 * Denne V1-implementering er en forberedt, men ikke aktiveret, adapter.
 * Den er IKKE aktivt integreret i demoen, indeholder INGEN opdigtede
 * produktionsdata, og laver ingen scraping af Premier Leagues hjemmeside.
 *
 * TODO – hvad mangler for at koble officielle data på (V2):
 * 1. Officielt kampprogram: hent sæsonens fixtures fra API-Football
 *    (eller anden licenseret kilde), map til Fixture-interfacet, og
 *    erstat generateSyntheticFixtures. Kør validateLeagueData på alt
 *    importeret data, før det bruges (samme regler som i V1: 20 hold,
 *    380 kampe, 19H/19U pr. hold).
 * 2. Resultater: hent færdigspillede kampe løbende og map til
 *    MatchResult, så Elo-historikken og tabellen kan opdateres med
 *    rigtige data i stedet for playedResults: new Map().
 * 3. Spillerfravær (skader/sygdom/landsholdsfravær): kræver en kilde med
 *    verificerede fraværsdata (fx et betalt API eller manuel kuratering)
 *    og verificationStatus sat korrekt pr. post - ikke antaget "verified"
 *    uden en reel kilde.
 * 4. Karantæner/kort: hent kortdata pr. kamp og udled aktive karantæner
 *    automatisk (i dag genereres CardEvent kun som illustrativ demo-data).
 * 5. Datastatus i UI: når en rigtig kilde er tilkoblet, skal
 *    DataProvider.load() returnere status "imported" eller
 *    "api-updated" (ikke "demo") baseret på kildens faktiske
 *    friskhed - se dataStatusLabels og DataStatusBadge.
 * 6. Ratelimit/cache: API-Football har kvoter - overvej en simpel
 *    server-side cache (fx Next.js' fetch-cache eller en KV-butik), så
 *    demoen ikke rammer loftet ved almindelig trafik.
 * 7. Rettigheder: bekræft at den valgte datakildes licensvilkår tillader
 *    den påtænkte brug, før officielle data vises i en offentlig app.
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
