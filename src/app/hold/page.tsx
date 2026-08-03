"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLeagueData } from "@/components/LeagueDataContext";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { TeamBadge } from "@/components/TeamBadge";
import { pct } from "@/lib/format";

export default function HoldPage() {
  const { view, loading, error, retry } = useLeagueData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const team = useMemo(() => {
    if (!view) return null;
    const id = selectedId ?? view.snapshot.teams[0]?.id ?? null;
    return view.snapshot.teams.find((t) => t.id === id) ?? null;
  }, [view, selectedId]);

  if (loading) return <LoadingState label="Indlæser holddata …" />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!view || !team) return null;

  const elo = view.eloByTeam.get(team.id) ?? 1500;
  const outcome = view.seasonSimulation.find((o) => o.teamId === team.id);
  const fatigue = view.fatigueByTeam.get(team.id);
  const worldCupLoad = view.worldCupLoadByTeam.get(team.id);
  const absenceScore = view.absenceScoreByTeam.get(team.id);
  const teamAbsences = view.snapshot.absences.filter((a) => a.teamId === team.id);
  const scheduleNext5 = view.scheduleScores.next5.find((s) => s.teamId === team.id);

  return (
    <section className="px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Hold</h1>

      <label className="text-xs text-elp-muted mb-2 block" htmlFor="team-select">
        Vælg hold
      </label>
      <select
        id="team-select"
        value={team.id}
        onChange={(e) => setSelectedId(e.target.value)}
        className="focus-ring min-h-touch w-full rounded-lg bg-elp-card px-3 py-2 text-elp-text mb-4"
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

      <div className="flex items-center gap-3 mb-4">
        <TeamBadge team={team} size={44} />
        <div>
          <p className="font-semibold">{team.name}</p>
          {team.isPromoted && (
            <p className="text-xs text-elp-purple">Oprykker 2026/27</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <InfoCard label="Elo-rating (foreløbig)" value={Math.round(elo).toString()} />
        <InfoCard
          label="Programstyrke (næste 5)"
          value={scheduleNext5 ? `${scheduleNext5.score}/100` : "–"}
        />
        <InfoCard
          label="Illustrativ hvile/belastning"
          value={fatigue ? `${fatigue.score}/100` : "–"}
        />
        <InfoCard
          label="Illustrativ VM-belastning"
          value={worldCupLoad ? `${worldCupLoad.teamScore}/100` : "–"}
        />
      </div>

      {outcome && (
        <div className="rounded-xl bg-elp-card p-4 mb-4">
          <h2 className="text-sm font-semibold text-elp-muted mb-2">
            Sandsynlighed for slutplacering
          </h2>
          <div aria-hidden="true" className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={outcome.positionProbabilities.map((p, i) => ({
                  position: i + 1,
                  chance: Math.round(p * 1000) / 10,
                }))}
              >
                <XAxis
                  dataKey="position"
                  stroke="#94A3B8"
                  fontSize={10}
                  interval={2}
                />
                <YAxis stroke="#94A3B8" fontSize={10} width={30} />
                <Tooltip
                  contentStyle={{ background: "#16213A", border: "none" }}
                  labelFormatter={(v) => `Plads ${v}`}
                  formatter={(v: number) => [`${v}%`, "Chance"]}
                />
                <Bar dataKey="chance" fill="#1F9D6B" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Tekstalternativ til grafen (§19): de tre mest sandsynlige placeringer som tal */}
          <p className="text-xs text-elp-muted mt-2">
            Tekstalternativ – mest sandsynlige placeringer:{" "}
            {outcome.positionProbabilities
              .map((p, i) => ({ pos: i + 1, p }))
              .sort((a, b) => b.p - a.p)
              .slice(0, 3)
              .map((x) => `${x.pos}. plads (${pct(x.p)})`)
              .join(", ")}
            .
          </p>
        </div>
      )}

      {outcome && (
        <div className="rounded-xl bg-elp-card p-4 mb-4">
          <h2 className="text-sm font-semibold text-elp-muted mb-2">Sæsonprognose</h2>
          <p className="text-sm">
            Forventede point: <strong>{Math.round(outcome.meanPoints)}</strong> (
            {Math.round(outcome.p10Points)}–{Math.round(outcome.p90Points)})
          </p>
          <p className="text-sm">Mesterskabschance: {pct(outcome.titleProbability)}</p>
          <p className="text-sm">Europæisk chance (top 6): {pct(outcome.europeanProbability)}</p>
          <p className="text-sm">Nedrykningschance: {pct(outcome.relegationProbability)}</p>
        </div>
      )}

      <div className="rounded-xl bg-elp-card p-4">
        <h2 className="text-sm font-semibold text-elp-muted mb-2">
          Fravær og karantæner ({teamAbsences.length})
        </h2>
        {teamAbsences.length === 0 ? (
          <p className="text-sm text-elp-muted">Ingen registrerede fravær i demo-data.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {teamAbsences.map((a) => (
              <li key={a.id} className="flex justify-between border-b border-white/5 pb-1 last:border-0">
                <span>{a.type} · {a.position}</span>
                <span className="text-elp-muted">{a.status}</span>
              </li>
            ))}
          </ul>
        )}
        {absenceScore && (
          <p className="text-xs text-elp-muted mt-2">
            Foreløbig fraværsscore: {absenceScore.score}/100 (kun forklarende, påvirker ikke kampberegningen i V1)
          </p>
        )}
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-elp-card p-3">
      <p className="text-xs text-elp-muted">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
