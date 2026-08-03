"use client";

import { useMemo } from "react";
import { useLeagueData } from "@/components/LeagueDataContext";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { TeamBadge } from "@/components/TeamBadge";
import { pct } from "@/lib/format";

export default function NaesteRundePage() {
  const { view, loading, error, retry } = useLeagueData();

  const teamsById = useMemo(() => {
    if (!view) return new Map();
    return new Map(view.snapshot.teams.map((t) => [t.id, t]));
  }, [view]);

  if (loading) return <LoadingState label="Indlæser næste runde …" />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!view) return null;

  const round = view.currentRound;
  const fixtures = view.snapshot.fixtures
    .filter((f) => f.round === round)
    .sort((a, b) => a.id.localeCompare(b.id));

  return (
    <section className="px-4 py-6">
      <h1 className="text-xl font-bold mb-1">Næste runde</h1>
      <p className="text-sm text-elp-muted mb-4">Runde {round} · 10 kampe</p>

      <ul className="space-y-3">
        {fixtures.map((f) => {
          const prob = view.nextRoundProbabilities.find((p) => p.fixtureId === f.id);
          const home = teamsById.get(f.homeTeamId);
          const away = teamsById.get(f.awayTeamId);
          if (!home || !away || !prob) return null;

          return (
            <li key={f.id} className="rounded-xl bg-elp-card p-4">
              <div className="flex items-center justify-between text-xs text-elp-muted mb-2">
                <span>{f.isDateTentative ? "Foreløbig dato" : new Date(f.kickoff ?? "").toLocaleDateString("da-DK")}</span>
                <span>{prob.expectedHomeGoals.toFixed(1)}–{prob.expectedAwayGoals.toFixed(1)} forv. mål</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TeamBadge team={home} size={28} />
                  <span className="text-sm">{home.name}</span>
                </div>
                <span className="text-elp-muted text-xs">vs</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{away.name}</span>
                  <TeamBadge team={away} size={28} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm mb-2">
                <div className="rounded-lg bg-elp-bg py-1.5">
                  <p className="text-elp-muted text-xs">H</p>
                  <p className="font-semibold">{pct(prob.homeWin)}</p>
                </div>
                <div className="rounded-lg bg-elp-bg py-1.5">
                  <p className="text-elp-muted text-xs">X</p>
                  <p className="font-semibold">{pct(prob.draw)}</p>
                </div>
                <div className="rounded-lg bg-elp-bg py-1.5">
                  <p className="text-elp-muted text-xs">U</p>
                  <p className="font-semibold">{pct(prob.awayWin)}</p>
                </div>
              </div>
              <p className="text-xs text-elp-muted">
                Mest sandsynlige resultat: {prob.mostLikelyScoreline.home}-{prob.mostLikelyScoreline.away}
                {" · "}Datakvalitet: syntetisk demo-data
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
