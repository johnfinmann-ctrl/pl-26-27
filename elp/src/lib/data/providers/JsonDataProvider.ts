import type { DataProvider, LeagueSnapshot } from "@/lib/data/DataProvider";
import { validateLeagueData } from "@/lib/model/validation/leagueValidation";

/**
 * Indlæser et importeret datasæt fra en JSON-struktur (fx manuelt
 * vedligeholdt lokal fil, jf. §5/§12: "Manuel administration af demo-fravær
 * må ligge i en lokal JSON-fil."). Behandler ekstern data som upålidelig
 * og validerer altid før brug.
 */
export class JsonDataProvider implements DataProvider {
  readonly name = "json-import";

  constructor(private readonly raw: unknown) {}

  async load(): Promise<LeagueSnapshot> {
    const data = this.raw as Partial<LeagueSnapshot> | null;

    if (!data || !Array.isArray(data.teams) || !Array.isArray(data.fixtures)) {
      return emptySnapshotWithError("Importeret JSON mangler teams/fixtures.");
    }

    const validation = validateLeagueData(data.teams, data.fixtures, {
      enforceProductionRules: true,
    });
    if (!validation.valid) {
      return emptySnapshotWithError(
        validation.issues.map((i) => i.message).join(" ")
      );
    }

    return {
      season: data.season ?? "ukendt",
      teams: data.teams,
      players: data.players ?? [],
      fixtures: data.fixtures,
      results: data.results ?? [],
      absences: data.absences ?? [],
      cardEvents: data.cardEvents ?? [],
      worldCupLoads: data.worldCupLoads ?? [],
      status: "imported",
      lastUpdated: new Date().toISOString(),
    };
  }
}

function emptySnapshotWithError(message: string): LeagueSnapshot {
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
    errorMessage: message,
  };
}
