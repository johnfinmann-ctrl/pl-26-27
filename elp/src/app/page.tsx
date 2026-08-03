"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLeagueData } from "@/components/LeagueDataContext";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { TeamBadge } from "@/components/TeamBadge";
import { DataStatusBadge } from "@/components/DataStatusBadge";
import { ModelStatusBadge } from "@/components/ModelStatusBadge";
import { useFavoriteTeam } from "@/hooks/useFavoriteTeam";
import { pct, pointsRange } from "@/lib/format";

export default function OverblikPage() {
  const { view, loading, error, retry, statusLabel } = useLeagueData();
  const { favoriteTeamId, setFavoriteTeamId, hydrated } = useFavoriteTeam();

  const teamsById = useMemo(() => {
    if (!view) return new Map();
    return new Map(view.snapshot.teams.map((t) => [t.id, t]));
  }, [view]);

  if (loading) return <LoadingState label={statusLabel ?? "Indlæser overblik …"} />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!view) return null;

  if (hydrated && !favoriteTeamId) {
    return (
      <section className="px-4 py-8">
        <h1 className="text-xl font-bold mb-1">Vælg dit hold</h1>
        <p className="text-sm text-elp-muted mb-4">
          Vi husker dit valg lokalt på din enhed. Du kan skifte hold når som
          helst.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {view.snapshot.teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setFavoriteTeamId(t.id)}
              className="focus-ring flex items-center gap-2 rounded-xl bg-elp-card p-3 min-h-touch text-left"
            >
              <TeamBadge team={t} size={32} />
              <span className="text-sm">{t.name}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  const favoriteTeam = favoriteTeamId ? teamsById.get(favoriteTeamId) : null;
  const favoriteOutcome = favoriteTeamId
    ? view.seasonSimulation.find((o) => o.teamId === favoriteTeamId)
    : null;
  const nextFixture = favoriteTeamId
    ? view.snapshot.fixtures
        .filter(
          (f) => f.homeTeamId === favoriteTeamId || f.awayTeamId === favoriteTeamId
        )
        .sort((a, b) => a.round - b.round)[0]
    : null;
  const nextProb = nextFixture
    ? view.nextRoundProbabilities.find((p) => p.fixtureId === nextFixture.id)
    : null;

  const expectedPosition = favoriteOutcome
    ? favoriteOutcome.positionProbabilities.reduce(
        (best, p, i) => (p > best.p ? { p, i } : best),
        { p: -1, i: 0 }
      ).i + 1
    : null;

  return (
    <section className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {favoriteTeam && <TeamBadge team={favoriteTeam} size={40} />}
          <div>
            <h1 className="text-xl font-bold">{favoriteTeam?.name ?? "Overblik"}</h1>
            <button
              onClick={() => setFavoriteTeamId(null)}
              className="focus-ring text-xs text-elp-muted underline"
            >
              Skift hold
            </button>
          </div>
        </div>
        <DataStatusBadge
          status={view.snapshot.status}
          lastUpdated={view.snapshot.lastUpdated}
        />
      </div>

      {nextFixture && nextProb && (
        <div className="rounded-xl bg-elp-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-elp-muted">
              Næste kamp
            </h2>
            <ModelStatusBadge status="active" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <TeamName teamsById={teamsById} id={nextFixture.homeTeamId} />
            <span className="text-elp-muted text-sm">vs</span>
            <TeamName teamsById={teamsById} id={nextFixture.awayTeamId} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <ProbBox label="H" value={nextProb.homeWin} />
            <ProbBox label="X" value={nextProb.draw} />
            <ProbBox label="U" value={nextProb.awayWin} />
          </div>
          <p className="text-xs text-elp-muted mt-2">
            Syntetisk testkamp – ikke Premier Leagues officielle
            kampprogram. Ikke egnet til betting eller økonomiske
            beslutninger.
          </p>
        </div>
      )}

      {favoriteOutcome && (
        <div className="rounded-xl bg-elp-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-elp-muted">
              Forventet slutplacering
            </h2>
            <ModelStatusBadge status="active" />
          </div>
          <p className="text-2xl font-bold">{expectedPosition}. plads (mest sandsynlig)</p>
          <p className="text-sm text-elp-muted">
            Forventet pointinterval: {pointsRange(favoriteOutcome.p10Points, favoriteOutcome.p90Points)}
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-sm pt-2">
            <ChanceBox label="Mesterskab" value={favoriteOutcome.titleProbability} />
            <ChanceBox label="Europa (top 6)" value={favoriteOutcome.europeanProbability} />
            <ChanceBox label="Nedrykning" value={favoriteOutcome.relegationProbability} />
          </div>
        </div>
      )}

      <div className="rounded-xl bg-elp-card p-4 space-y-2">
        <h2 className="text-sm font-semibold text-elp-muted">
          De tre vigtigste forklaringer
        </h2>
        <ul className="text-sm space-y-1 list-disc list-inside text-elp-text/90">
          <li>Sandsynlighederne bygger på foreløbige, ikke-backtestede Elo-parametre.</li>
          <li>Sæsonsimuleringen bruger en fastfrosset rating gennem hele sæsonen.</li>
          <li>VM-belastning og fravær vises kun forklarende og påvirker endnu ikke resultatet.</li>
        </ul>
      </div>

      <Link
        href="/metoden"
        className="focus-ring inline-block text-sm text-elp-green underline"
      >
        Læs om metoden bag tallene
      </Link>
    </section>
  );
}

function TeamName({
  teamsById,
  id,
}: {
  teamsById: Map<string, { id: string; name: string; shortName: string; colorPrimary: string } & Record<string, unknown>>;
  id: string;
}) {
  const team = teamsById.get(id);
  if (!team) return null;
  return (
    <div className="flex items-center gap-2">
      <TeamBadge team={team as never} size={28} />
      <span className="text-sm">{team.name}</span>
    </div>
  );
}

function ProbBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-elp-bg py-2">
      <p className="text-elp-muted text-xs">{label}</p>
      <p className="font-semibold">{pct(value)}</p>
    </div>
  );
}

function ChanceBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-elp-bg py-2 px-1">
      <p className="text-elp-muted text-xs">{label}</p>
      <p className="font-semibold">{pct(value)}</p>
    </div>
  );
}
