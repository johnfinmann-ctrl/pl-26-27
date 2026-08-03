import type {
  Absence,
  CardEvent,
  Fixture,
  MatchResult,
  Player,
  Team,
  WorldCupLoad,
} from "@/types/domain";

export type DataStatus =
  | "demo"
  | "imported"
  | "api-updated"
  | "stale"
  | "error"
  | "partially-verified";

export interface LeagueSnapshot {
  season: string;
  teams: Team[];
  players: Player[];
  fixtures: Fixture[];
  results: MatchResult[];
  absences: Absence[];
  cardEvents: CardEvent[];
  worldCupLoads: WorldCupLoad[];
  status: DataStatus;
  lastUpdated: string;
  errorMessage?: string;
}

/**
 * Fælles adapter-interface. Appen må ikke være direkte afhængig af en
 * bestemt leverandør (§5). Implementeres af DemoDataProvider,
 * JsonDataProvider, ApiFootballProvider og senere SupabaseDataProvider.
 */
export interface DataProvider {
  readonly name: string;
  load(): Promise<LeagueSnapshot>;
}
