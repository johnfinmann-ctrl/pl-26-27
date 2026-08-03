"use client";

import { useMemo, useState } from "react";
import { useLeagueData } from "@/components/LeagueDataContext";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { TeamBadge } from "@/components/TeamBadge";
import { pct } from "@/lib/format";

type SortKey = "meanPoints" | "titleProbability" | "relegationProbability";

export default function PrognosePage() {
  const { view, loading, error, retry } = useLeagueData();
  const [sortKey, setSortKey] = useState<SortKey>("meanPoints");

  const teamsById = useMemo(() => {
    if (!view) return new Map();
    return new Map(view.snapshot.teams.map((t) => [t.id, t]));
  }, [view]);

  if (loading) return <LoadingState label="Beregner prognose …" />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!view) return null;

  const sorted = [...view.seasonSimulation].sort((a, b) => {
    if (sortKey === "relegationProbability") {
      return b[sortKey] - a[sortKey];
    }
    return b[sortKey] - a[sortKey];
  });

  return (
    <section className="px-4 py-6">
      <h1 className="text-xl font-bold mb-1">Prognose</h1>
      <p className="text-sm text-elp-muted mb-4">
        Forventet tabel baseret på {view.snapshot.status === "demo" ? "10.000 simuleringer af demo-data" : "10.000 simuleringer"}.
      </p>

      <label className="text-xs text-elp-muted mb-2 block">
        Sortér efter
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="focus-ring ml-2 min-h-touch rounded-lg bg-elp-card px-2 py-1 text-elp-text"
        >
          <option value="meanPoints">Gennemsnitlige point</option>
          <option value="titleProbability">Mesterskabschance</option>
          <option value="relegationProbability">Nedrykningschance</option>
        </select>
      </label>

      <ul className="space-y-2 mt-3" aria-label="Forventet tabel">
        {sorted.map((o, index) => {
          const team = teamsById.get(o.teamId);
          if (!team) return null;
          const rowClass =
            index < 4
              ? "border-l-4 border-elp-green"
              : index < 6
                ? "border-l-4 border-elp-purple"
                : index >= 17
                  ? "border-l-4 border-elp-danger"
                  : "border-l-4 border-transparent";

          return (
            <li
              key={o.teamId}
              className={`flex items-center gap-3 rounded-r-xl bg-elp-card p-3 ${rowClass}`}
            >
              <span className="w-5 text-sm text-elp-muted">{index + 1}</span>
              <TeamBadge team={team} size={30} />
              <span className="flex-1 text-sm">{team.name}</span>
              <div className="text-right text-sm">
                <p className="font-semibold">{Math.round(o.meanPoints)} p</p>
                <p className="text-xs text-elp-muted">
                  {Math.round(o.p10Points)}–{Math.round(o.p90Points)}
                </p>
              </div>
              <div className="text-right text-xs text-elp-muted w-16">
                <p>M {pct(o.titleProbability)}</p>
                <p>N {pct(o.relegationProbability)}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-elp-muted mt-4">
        Grøn markering: top 4. Lilla: øvrige europæiske pladser (top 6). Rød:
        nedrykningszone. Farve er aldrig den eneste informationsbærer –
        placering og procenter vises altid som tekst.
      </p>
    </section>
  );
}
