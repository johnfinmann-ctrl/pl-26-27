import type { Team } from "@/types/domain";

/**
 * De præcis 20 klubber i sæsonen 2026/27 (§4).
 * Neutrale, selvvalgte appfarve pr. hold – ingen officielle klubfarver/logoer.
 */
const now = "2026-07-01T00:00:00.000Z";

const promoted = new Set(["coventry-city", "hull-city", "ipswich-town"]);

interface ClubSeed {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

export const CLUB_SEEDS: ClubSeed[] = [
  { id: "arsenal", name: "Arsenal", shortName: "ARS", color: "#1F9D6B" },
  { id: "aston-villa", name: "Aston Villa", shortName: "AVL", color: "#8B7FD1" },
  { id: "afc-bournemouth", name: "AFC Bournemouth", shortName: "BOU", color: "#2B6CB0" },
  { id: "brentford", name: "Brentford", shortName: "BRE", color: "#C05621" },
  { id: "brighton-hove-albion", name: "Brighton & Hove Albion", shortName: "BHA", color: "#0E7490" },
  { id: "chelsea", name: "Chelsea", shortName: "CHE", color: "#3182CE" },
  { id: "coventry-city", name: "Coventry City", shortName: "COV", color: "#805AD5" },
  { id: "crystal-palace", name: "Crystal Palace", shortName: "CRY", color: "#B7791F" },
  { id: "everton", name: "Everton", shortName: "EVE", color: "#2C5282" },
  { id: "fulham", name: "Fulham", shortName: "FUL", color: "#718096" },
  { id: "hull-city", name: "Hull City", shortName: "HUL", color: "#D69E2E" },
  { id: "ipswich-town", name: "Ipswich Town", shortName: "IPS", color: "#2F855A" },
  { id: "leeds-united", name: "Leeds United", shortName: "LEE", color: "#5A67D8" },
  { id: "liverpool", name: "Liverpool", shortName: "LIV", color: "#E53E3E" },
  { id: "manchester-city", name: "Manchester City", shortName: "MCI", color: "#4299E1" },
  { id: "manchester-united", name: "Manchester United", shortName: "MUN", color: "#C53030" },
  { id: "newcastle-united", name: "Newcastle United", shortName: "NEW", color: "#1A202C" },
  { id: "nottingham-forest", name: "Nottingham Forest", shortName: "NFO", color: "#DD6B20" },
  { id: "sunderland", name: "Sunderland", shortName: "SUN", color: "#E53E3E" },
  { id: "tottenham-hotspur", name: "Tottenham Hotspur", shortName: "TOT", color: "#F7FAFC" },
];

export const DEMO_TEAMS: Team[] = CLUB_SEEDS.map((c) => ({
  id: c.id,
  name: c.name,
  shortName: c.shortName,
  isPromoted: promoted.has(c.id),
  colorPrimary: c.color,
  internalId: c.id,
  source: "demo",
  lastUpdated: now,
  dataQuality: "synthetic",
  verificationStatus: "not-applicable",
}));

export const SEASON = "2026/27";
