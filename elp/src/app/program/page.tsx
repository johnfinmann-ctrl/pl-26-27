"use client";

import { useMemo, useState } from "react";
import { useLeagueData } from "@/components/LeagueDataContext";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { TeamBadge } from "@/components/TeamBadge";
import { DataStatusBadge } from "@/components/DataStatusBadge";
import { ModelStatusBadge } from "@/components/ModelStatusBadge";
import type { ScheduleWindow } from "@/types/domain";

const windowLabels: Record<ScheduleWindow, string> = {
  next5: "Næste fem",
  next10: "Næste ti",
  christmas: "Juleperioden",
  last10: "Sidste ti",
  last5: "Sidste fem",
  season: "Hele sæsonen",
};

const categoryLabel = {
  easier: "Relativt lettere",
  medium: "Middel",
  harder: "Relativt sværere",
};

const categoryColor = {
  easier: "bg-elp-green",
  medium: "bg-elp-warn",
  harder: "bg-elp-danger",
};

export default function ProgramPage() {
  const { view, loading, error, retry, statusLabel } = useLeagueData();
  const [window, setWindow] = useState<ScheduleWindow>("next5");

  const teamsById = useMemo(() => {
    if (!view) return new Map();
    return new Map(view.snapshot.teams.map((t) => [t.id, t]));
  }, [view]);

  if (loading) return <LoadingState label={statusLabel ?? "Beregner programstyrke …"} />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!view) return null;

  const scores = [...view.scheduleScores[window]].sort((a, b) => a.score - b.score);

  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">Program</h1>
        <DataStatusBadge status={view.snapshot.status} lastUpdated={view.snapshot.lastUpdated} />
      </div>
      <div className="mb-3">
        <ModelStatusBadge status="illustrative" />
      </div>
      <p className="text-sm text-elp-muted mb-1">
        Programstyrken er relativ og afhænger af de tilgængelige data om
        modstanderstyrke og hjemme/ude-fordeling. Den er en beregnet
        oversigt, men ændrer ikke selve kampsandsynlighederne.
      </p>
      <p className="text-xs text-elp-muted mb-4">
        Kampprogrammet er syntetisk testdata og er ikke Premier Leagues
        officielle kampprogram. Må ikke bruges til betting eller
        økonomiske beslutninger.
      </p>

      <div
        role="tablist"
        aria-label="Vælg periode"
        className="flex gap-2 overflow-x-auto pb-2 mb-4"
      >
        {(Object.keys(windowLabels) as ScheduleWindow[]).map((w) => (
          <button
            key={w}
            role="tab"
            aria-selected={window === w}
            onClick={() => setWindow(w)}
            className={`focus-ring min-h-touch whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
              window === w ? "bg-elp-green text-elp-bg" : "bg-elp-card text-elp-text"
            }`}
          >
            {windowLabels[w]}
          </button>
        ))}
      </div>

      <ul className="space-y-2" aria-label={`Programstyrke for ${windowLabels[window]}`}>
        {scores.map((s) => {
          const team = teamsById.get(s.teamId);
          if (!team) return null;
          return (
            <li key={s.teamId} className="flex items-center gap-3 rounded-xl bg-elp-card p-3">
              <TeamBadge team={team} size={30} />
              <span className="flex-1 text-sm">{team.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium text-elp-bg ${categoryColor[s.category]}`}
              >
                {categoryLabel[s.category]}
              </span>
              <span className="w-10 text-right text-sm font-semibold">{s.score}</span>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-elp-muted mt-4">
        0–33: relativt lettere · 34–66: middel · 67–100: relativt sværere.
        Ingen subjektiv motivationseffekt eller vilkårlige bonusser indgår.
      </p>
    </section>
  );
}
