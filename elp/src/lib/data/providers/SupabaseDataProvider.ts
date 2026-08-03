import type { DataProvider, LeagueSnapshot } from "@/lib/data/DataProvider";

/**
 * Forberedt adapter til senere Supabase-integration (§1). IKKE aktiveret i
 * V1 - projektet er ikke koblet til Supabase. Findes for at vise, at
 * arkitekturen kan udvides uden at ændre beregningsmotoren.
 */
export class SupabaseDataProvider implements DataProvider {
  readonly name = "supabase";

  async load(): Promise<LeagueSnapshot> {
    throw new Error(
      "SupabaseDataProvider er ikke aktiveret i V1. Projektet er ikke koblet til Supabase."
    );
  }
}
