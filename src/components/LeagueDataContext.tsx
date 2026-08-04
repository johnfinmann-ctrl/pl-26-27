"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { selectClientDataProvider } from "@/lib/data/selectDataProvider";
import {
  buildLeagueViewBase,
  buildSimulationInput,
  type LeagueView,
} from "@/lib/engine/buildLeagueView";
import { simulationConfig } from "@/lib/config/model-config";
import { useSimulationRunner } from "@/lib/simulation/useSimulationRunner";

type Stage =
  | { kind: "loading-data" }
  | { kind: "simulating" }
  | { kind: "error"; message: string }
  | { kind: "ready"; view: LeagueView };

interface LeagueDataContextValue {
  view: LeagueView | null;
  loading: boolean;
  /** Menneskelæsbar status, mens data indlæses/simuleres (§9, §20). */
  statusLabel: string | null;
  supportsWorker: boolean;
  error: string | null;
  retry: () => void;
}

const LeagueDataContext = createContext<LeagueDataContextValue | null>(null);

export function LeagueDataProvider({ children }: { children: ReactNode }) {
  // Al tilstand samles i ét objekt, så vi aldrig kalder setState synkront
  // flere gange i træk inde i selve effekt-kroppen (react-hooks'
  // set-state-in-effect-regel) - kun via async-fortsættelser eller
  // hændelseshandlere som retry().
  const [stage, setStage] = useState<Stage>({ kind: "loading-data" });
  const [attempt, setAttempt] = useState(0);
  const { run, supportsWorker } = useSimulationRunner();
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  }, [run]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const provider = selectClientDataProvider();
        const snapshot = await provider.load();

        if (cancelled) return;

        if (snapshot.status === "error") {
          setStage({
            kind: "error",
            message: snapshot.errorMessage ?? "Ukendt fejl i datavalidering.",
          });
          return;
        }

        const base = buildLeagueViewBase(snapshot);
        setStage({ kind: "simulating" });

        const simulationInput = buildSimulationInput(base, {
          numberOfSimulations: simulationConfig.interactiveSimulations,
          seed: null,
        });
        const simulation = await runRef.current(simulationInput);

        if (cancelled) return;

        setStage({
          kind: "ready",
          view: { ...base, seasonSimulation: simulation.outcomes },
        });
      } catch (e) {
        if (!cancelled) {
          setStage({
            kind: "error",
            message:
              e instanceof Error ? e.message : "Ukendt fejl under indlæsning.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    // Kaldes fra en knap (hændelseshandler), ikke inde i effekten, så det
    // er sikkert at nulstille tilstanden synkront her.
    setStage({ kind: "loading-data" });
    setAttempt((a) => a + 1);
  }, []);

  const value = useMemo<LeagueDataContextValue>(() => {
    switch (stage.kind) {
      case "loading-data":
        return {
          view: null,
          loading: true,
          statusLabel: "Indlæser data …",
          supportsWorker,
          error: null,
          retry,
        };
      case "simulating":
        return {
          view: null,
          loading: true,
          statusLabel: supportsWorker
            ? `Kører ${simulationConfig.interactiveSimulations.toLocaleString("da-DK")} simuleringer i baggrunden …`
            : `Kører ${simulationConfig.interactiveSimulations.toLocaleString("da-DK")} simuleringer … (kan tage lidt tid på denne enhed)`,
          supportsWorker,
          error: null,
          retry,
        };
      case "error":
        return {
          view: null,
          loading: false,
          statusLabel: null,
          supportsWorker,
          error: stage.message,
          retry,
        };
      case "ready":
        return {
          view: stage.view,
          loading: false,
          statusLabel: null,
          supportsWorker,
          error: null,
          retry,
        };
    }
  }, [stage, supportsWorker, retry]);

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
