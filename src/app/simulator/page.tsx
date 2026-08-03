"use client";

import { useMemo, useState } from "react";
import { useLeagueData } from "@/components/LeagueDataContext";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { TeamBadge } from "@/components/TeamBadge";
import { simulateSeason } from "@/lib/model/simulation/simulateSeason";
import { pct } from "@/lib/format";
import type { TeamSeasonOutcome } from "@/types/domain";

const SCENARIO_SIMULATIONS = 3000;

export default function SimulatorPage() {
  const { view, loading, error, retry } = useLeagueData();
  const [teamId, setTeamId] = useState<string | null>(null);
  const [fixtureId, setFixtureId] = useState<string | null>(null);
  const [homeGoals, setHomeGoals] = useState(1);
  const [awayGoals, setAwayGoals] = useState(1);
  const [scenarioResult, setScenarioResult] = useState<TeamSeasonOutcome[] | null>(null);
  const [computing, setComputing] = useState(false);

  const teamsById = useMemo(() => {
    if (!view) return new Map();
    return new Map(view.snapshot.teams.map((t) => [t.id, t]));
  }, [view]);

  if (loading) return <LoadingState label="Indlæser simulator …" />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!view) return null;

  const currentTeamId = teamId ?? view.snapshot.teams[0].id;
  const upcomingFixtures = view.snapshot.fixtures
    .filter((f) => f.homeTeamId === currentTeamId || f.awayTeamId === currentTeamId)
    .sort((a, b) => a.round - b.round)
    .slice(0, 10);

  const currentFixtureId = fixtureId ?? upcomingFixtures[0]?.id ?? null;
  const currentFixture = upcomingFixtures.find((f) => f.id === currentFixtureId);

  const baseOutcome = view.seasonSimulation.find((o) => o.teamId === currentTeamId);
  const scenarioOutcome = scenarioResult?.find((o) => o.teamId === currentTeamId);
  const leagueView = view;

  function runScenario() {
    if (!currentFixture) return;
    setComputing(true);
    // Kør beregningen asynkront på næste tick, så UI kan vise "beregner"
    setTimeout(() => {
      const overrides = new Map([[currentFixture.id, { homeGoals, awayGoals }]]);
      const result = simulateSeason({
        teams: leagueView.snapshot.teams,
        allFixtures: leagueView.snapshot.fixtures,
        playedResults: new Map(),
        eloByTeam: leagueView.eloByTeam,
        numberOfSimulations: SCENARIO_SIMULATIONS,
        seed: null,
        overrides,
      });
      setScenarioResult(result.outcomes);
      setComputing(false);
    }, 10);
  }

  function resetScenario() {
    setScenarioResult(null);
  }

  return (
    <section className="px-4 py-6">
      <h1 className="text-xl font-bold mb-1">Hvad nu hvis?</h1>
      <p className="text-sm text-elp-muted mb-4">
        Simulatoren ændrer aldrig basismodellen eller de oprindelige data –
        kun dette scenarie.
      </p>

      <label className="text-xs text-elp-muted mb-1 block" htmlFor="sim-team">
        Vælg hold
      </label>
      <select
        id="sim-team"
        value={currentTeamId}
        onChange={(e) => {
          setTeamId(e.target.value);
          setFixtureId(null);
          setScenarioResult(null);
        }}
        className="focus-ring min-h-touch w-full rounded-lg bg-elp-card px-3 py-2 mb-3"
      >
        {view.snapshot.teams
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
      </select>

      <label className="text-xs text-elp-muted mb-1 block" htmlFor="sim-fixture">
        Vælg kommende kamp
      </label>
      <select
        id="sim-fixture"
        value={currentFixtureId ?? ""}
        onChange={(e) => {
          setFixtureId(e.target.value);
          setScenarioResult(null);
        }}
        className="focus-ring min-h-touch w-full rounded-lg bg-elp-card px-3 py-2 mb-3"
      >
        {upcomingFixtures.map((f) => {
          const home = teamsById.get(f.homeTeamId);
          const away = teamsById.get(f.awayTeamId);
          return (
            <option key={f.id} value={f.id}>
              Runde {f.round}: {home?.shortName} - {away?.shortName}
            </option>
          );
        })}
      </select>

      {currentFixture && (
        <div className="flex items-center gap-3 mb-4">
          <NumberField
            label={teamsById.get(currentFixture.homeTeamId)?.shortName ?? "H"}
            value={homeGoals}
            onChange={setHomeGoals}
          />
          <span className="text-elp-muted">–</span>
          <NumberField
            label={teamsById.get(currentFixture.awayTeamId)?.shortName ?? "U"}
            value={awayGoals}
            onChange={setAwayGoals}
          />
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <button
          onClick={runScenario}
          disabled={computing}
          className="focus-ring min-h-touch flex-1 rounded-lg bg-elp-green px-4 py-2 font-medium text-elp-bg disabled:opacity-60"
        >
          {computing ? "Genberegner …" : "Genberegn sæson"}
        </button>
        <button
          onClick={resetScenario}
          className="focus-ring min-h-touch rounded-lg bg-elp-card px-4 py-2 font-medium"
        >
          Nulstil scenarie
        </button>
      </div>

      {baseOutcome && (
        <div className="rounded-xl bg-elp-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-elp-muted">
            {teamsById.get(currentTeamId)?.name}
          </h2>
          <ComparisonRow
            label="Forventede point"
            base={Math.round(baseOutcome.meanPoints)}
            scenario={scenarioOutcome ? Math.round(scenarioOutcome.meanPoints) : null}
          />
          <ComparisonRow
            label="Mesterskabschance"
            base={pct(baseOutcome.titleProbability)}
            scenario={scenarioOutcome ? pct(scenarioOutcome.titleProbability) : null}
          />
          <ComparisonRow
            label="Europæisk chance (top 6)"
            base={pct(baseOutcome.europeanProbability)}
            scenario={scenarioOutcome ? pct(scenarioOutcome.europeanProbability) : null}
          />
          <ComparisonRow
            label="Nedrykningschance"
            base={pct(baseOutcome.relegationProbability)}
            scenario={scenarioOutcome ? pct(scenarioOutcome.relegationProbability) : null}
          />
        </div>
      )}
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col items-center gap-1 text-xs text-elp-muted">
      {label}
      <input
        type="number"
        min={0}
        max={9}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(9, Number(e.target.value))))}
        className="focus-ring min-h-touch w-16 rounded-lg bg-elp-card px-2 py-2 text-center text-elp-text"
      />
    </label>
  );
}

function ComparisonRow({
  label,
  base,
  scenario,
}: {
  label: string;
  base: string | number;
  scenario: string | number | null;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-elp-muted">{label}</span>
      <span>
        {base}
        {scenario !== null && (
          <>
            {" → "}
            <strong className="text-elp-green">{scenario}</strong>
          </>
        )}
      </span>
    </div>
  );
}
