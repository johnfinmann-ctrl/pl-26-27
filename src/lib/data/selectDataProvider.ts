import type { DataProvider } from "@/lib/data/DataProvider";
import { DemoDataProvider } from "@/lib/data/demo/DemoDataProvider";

/**
 * Vælger dataleverandør til klient-brug. I V1 er DemoDataProvider altid
 * standard i browseren; API-Football-adapteren kaldes udelukkende
 * server-side (fx i en route handler), aldrig direkte herfra, så
 * API-nøglen aldrig risikerer at blive bundlet til klienten (§7).
 */
export function selectClientDataProvider(): DataProvider {
  return new DemoDataProvider();
}
