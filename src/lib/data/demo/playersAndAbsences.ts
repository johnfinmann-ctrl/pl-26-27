import type {
  Absence,
  CardEvent,
  Player,
  Team,
  WorldCupLoad,
} from "@/types/domain";
import { createRng } from "@/lib/model/simulation/rng";

const now = "2026-07-01T00:00:00.000Z";
const positions: Player["position"][] = ["GK", "DF", "MF", "FW"];

/**
 * Genererer et lille, deterministisk sæt illustrative spillere pr. hold.
 * Dette er IKKE rigtige spillertrupper – kun demo-data (§6, §12).
 */
export function generateDemoPlayers(teams: Team[]): Player[] {
  const rng = createRng(1234);
  const players: Player[] = [];

  teams.forEach((team) => {
    positions.forEach((pos, pi) => {
      const importance = Math.round((0.4 + rng() * 0.55) * 100) / 100;
      players.push({
        id: `${team.id}-p${pi + 1}`,
        teamId: team.id,
        name: `${team.shortName} Spiller ${pi + 1}`,
        position: pos,
        importance,
        squadDepthRank: 1,
        internalId: `${team.id}-p${pi + 1}`,
        source: "demo",
        lastUpdated: now,
        dataQuality: "synthetic",
        verificationStatus: "not-applicable",
      });
    });
  });

  return players;
}

/**
 * Genererer nogle få illustrative skader/karantæner (§12), tydeligt mærket
 * som demo-data. Ikke afledt af virkelige hændelser.
 */
export function generateDemoAbsences(players: Player[]): Absence[] {
  const rng = createRng(5678);
  const absences: Absence[] = [];

  // Vælg et lille udvalg af spillere til illustrative fravær.
  const sample = players.filter((_, i) => i % 9 === 0).slice(0, 8);
  const types: Absence["type"][] = ["injury", "illness", "suspension", "international-duty"];
  const statuses: Absence["status"][] = [
    "doubtful",
    "expected-back",
    "back-but-limited",
    "out",
  ];

  sample.forEach((p, i) => {
    const type = types[i % types.length];
    const status = statuses[i % statuses.length];
    absences.push({
      id: `absence-${p.id}`,
      playerId: p.id,
      teamId: p.teamId,
      type,
      status,
      startDate: "2026-08-01T00:00:00.000Z",
      expectedEndDate: status === "out" ? null : "2026-09-01T00:00:00.000Z",
      expectedMissedMatches: 1 + Math.floor(rng() * 3),
      position: p.position,
      expectedMinuteShare: Math.round((0.3 + rng() * 0.6) * 100) / 100,
      playerImportance: p.importance,
      replacementPlayerId: null,
      internalId: `absence-${p.id}`,
      source: "demo",
      lastUpdated: now,
      dataQuality: "synthetic",
      verificationStatus: "not-applicable",
    });
  });

  return absences;
}

/**
 * Genererer nogle få illustrative kort-hændelser (§13), til demo-visning af
 * karantæner. Ikke virkelige hændelser.
 */
export function generateDemoCardEvents(players: Player[]): CardEvent[] {
  const rng = createRng(9012);
  const sample = players.filter((_, i) => i % 13 === 0).slice(0, 5);

  return sample.map((p, i) => {
    const type: CardEvent["type"] = i % 3 === 0 ? "red" : "second-yellow";
    return {
      id: `card-${p.id}`,
      fixtureId: `synthetic-r${1 + Math.floor(rng() * 5)}-illustrative`,
      playerId: p.id,
      minute: 20 + Math.floor(rng() * 70),
      type,
      resultingSuspensionMatches: type === "red" ? 1 : 1,
      appealStatus: "none",
      internalId: `card-${p.id}`,
      source: "demo",
      lastUpdated: now,
      dataQuality: "synthetic",
      verificationStatus: "not-applicable",
    };
  });
}

/**
 * Genererer illustrative VM-belastningsdata for nogle nøglespillere pr. hold
 * (§11). Tydeligt mærket som ikke-valideret.
 */
export function generateDemoWorldCupLoads(players: Player[]): WorldCupLoad[] {
  const rng = createRng(3456);
  const key = players.filter((p) => p.position === "FW" || p.position === "MF");

  return key.map((p) => ({
    teamId: p.teamId,
    playerId: p.id,
    minutesAtWorldCup: Math.floor(rng() * 450),
    lastMatchDate: "2026-07-19T00:00:00.000Z",
    travelTimezoneShift: Math.floor(rng() * 8),
    vacationDays: 10 + Math.floor(rng() * 15),
    clubTrainingDaysMissed: Math.floor(rng() * 21),
    expectedClubMinuteShare: Math.round((0.3 + rng() * 0.6) * 100) / 100,
    replacementQuality: Math.round(rng() * 100) / 100,
    illustrative: true,
    internalId: `wcload-${p.id}`,
    source: "demo",
    lastUpdated: now,
    dataQuality: "synthetic",
    verificationStatus: "not-applicable",
  }));
}
