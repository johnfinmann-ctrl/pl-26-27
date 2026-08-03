"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { selectClientDataProvider } from "@/lib/data/selectDataProvider";
import { buildLeagueView, type LeagueView } from "@/lib/engine/buildLeagueView";
import { simulationConfig } from "@/lib/config/model-config";

interface LeagueDataContextValue {
  view: LeagueView | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

const LeagueDataContext = createContext<LeagueDataContextValue | null>(null);

export function LeagueDataProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<LeagueView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const provider = selectClientDataProvider();
        const snapshot = await provider.load();

        if (snapshot.status === "error") {
          if (!cancelled) {
            setError(snapshot.errorMessage ?? "Ukendt fejl i datavalidering.");
            setLoading(false);
          }
          return;
        }

        // Interaktiv demo bruger det konfigurerede antal simuleringer (§9).
        const built = buildLeagueView(snapshot, {
          numberOfSimulations: simulationConfig.interactiveSimulations,
          seed: null,
        });

        if (!cancelled) {
          setView(built);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Ukendt fejl under indlæsning.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const value = useMemo(
    () => ({ view, loading, error, retry: () => setAttempt((a) => a + 1) }),
    [view, loading, error]
  );

  return (
    <LeagueDataContext.Provider value={value}>
      {children}
    </LeagueDataContext.Provider>
  );
}

export function useLeagueData() {
  const ctx = useContext(LeagueDataContext);
  if (!ctx) {
    throw new Error("useLeagueData skal bruges inden i LeagueDataProvider.");
  }
  return ctx;
}
