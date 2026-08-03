/**
 * Kerne-datatyper for English League Predictor.
 * Alle poster har så vidt muligt: internt ID, ekstern datakilde-ID,
 * datakilde, tidspunkt for seneste opdatering, datakvalitet og
 * verificeringsstatus (§5 i spec).
 */

export type DataSource =
  | "demo"
  | "json-import"
  | "api-football"
  | "supabase"
  | "manual";

export type DataQuality =
  | "synthetic" // rent syntetisk demo-data
  | "unverified" // importeret, ikke krydstjekket
  | "verified" // krydstjekket mod kilde
  | "stale"; // for gammel til at stole på

export type VerificationStatus =
  | "not-applicable"
  | "unverified"
  | "partially-verified"
  | "verified";

export interface SourceMeta {
  internalId: string;
  externalId?: string;
  source: DataSource;
  lastUpdated: string; // ISO-8601
  dataQuality: DataQuality;
  verificationStatus: VerificationStatus;
}

export interface ModelVersion {
  id: string; // fx "demo-v1"
  label: string;
  createdAt: string;
  description: string;
  backtested: boolean;
}

export interface Team extends SourceMeta {
  id: string; // stabilt slug, fx "arsenal"
  name: string;
  shortName: string; // klubforkortelse, fx "ARS"
  isPromoted: boolean;
  colorPrimary: string; // neutral, selvvalgt appfarve – ikke klubbens rigtige farve
}

export interface Player extends SourceMeta {
  id: string;
  teamId: string;
  name: string;
  position: "GK" | "DF" | "MF" | "FW";
  importance: number; // 0-1, spillerens betydning for holdet
  squadDepthRank: number; // 1 = førstevalg på pladsen
}

export type FixtureStatus = "scheduled" | "tentative" | "played" | "postponed";

export interface Fixture extends SourceMeta {
  id: string;
  season: string; // fx "2026/27"
  round: number; // 1-38
  homeTeamId: string;
  awayTeamId: string;
  kickoff: string | null; // ISO-8601 eller null hvis foreløbig
  isDateTentative: boolean;
  status: FixtureStatus;
}

export interface MatchResult extends SourceMeta {
  id: string;
  fixtureId: string;
  homeGoals: number;
  awayGoals: number;
}

export interface TeamRating extends SourceMeta {
  teamId: string;
  elo: number;
  asOf: string; // ISO-8601
  modelVersionId: string;
}

export interface EloHistoryEntry extends SourceMeta {
  teamId: string;
  fixtureId: string;
  eloBefore: number;
  eloAfter: number;
  date: string;
}

export interface MatchProbability {
  fixtureId: string;
  homeWin: number;
  draw: number;
  awayWin: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  mostLikelyScoreline: { home: number; away: number; probability: number };
  scorelineMatrix: number[][]; // [homeGoals][awayGoals], 0..7+ (7 = "7 or more")
  modelVersionId: string;
}

export interface TeamSeasonOutcome {
  teamId: string;
  meanPoints: number;
  medianPoints: number;
  p10Points: number;
  p90Points: number;
  positionProbabilities: number[]; // index 0 = plads 1, ... index 19 = plads 20
  titleProbability: number;
  europeanProbability: number;
  relegationProbability: number;
}

export interface SeasonSimulation {
  id: string;
  season: string;
  runAt: string;
  numberOfSimulations: number;
  seed: number | null;
  modelVersionId: string;
  frozenRatings: boolean;
  outcomes: TeamSeasonOutcome[];
}

export type ScheduleWindow =
  | "next5"
  | "next10"
  | "christmas"
  | "last10"
  | "last5"
  | "season";

export interface ScheduleScore extends SourceMeta {
  teamId: string;
  window: ScheduleWindow;
  score: number; // 0-100, relativt normaliseret
  category: "easier" | "medium" | "harder";
  explanation: string;
}

export interface FatigueScore extends SourceMeta {
  teamId: string;
  asOf: string;
  restDaysAverage: number;
  cupMatchesNearby: number;
  score: number; // 0-100, illustrativ
}

export interface WorldCupLoad extends SourceMeta {
  teamId: string;
  playerId: string;
  minutesAtWorldCup: number;
  lastMatchDate: string | null;
  travelTimezoneShift: number; // timer
  vacationDays: number;
  clubTrainingDaysMissed: number;
  expectedClubMinuteShare: number; // 0-1
  replacementQuality: number; // 0-1
  illustrative: true;
}

export type AbsenceType =
  | "injury"
  | "illness"
  | "suspension"
  | "international-duty";

export type AbsenceStatus =
  | "doubtful"
  | "expected-back"
  | "back-but-limited"
  | "fully-available"
  | "out";

export interface Absence extends SourceMeta {
  id: string;
  playerId: string;
  teamId: string;
  type: AbsenceType;
  status: AbsenceStatus;
  startDate: string;
  expectedEndDate: string | null;
  expectedMissedMatches: number;
  position: Player["position"];
  expectedMinuteShare: number;
  playerImportance: number;
  replacementPlayerId: string | null;
}

export type CardType = "yellow" | "second-yellow" | "red";

export interface CardEvent extends SourceMeta {
  id: string;
  fixtureId: string;
  playerId: string;
  minute: number;
  type: CardType;
  reason?: string;
  resultingSuspensionMatches: number;
  appealStatus: "none" | "pending" | "upheld" | "overturned";
}

export interface Suspension extends SourceMeta {
  id: string;
  playerId: string;
  teamId: string;
  causeCardEventId: string;
  missedMatchesRemaining: number;
}
