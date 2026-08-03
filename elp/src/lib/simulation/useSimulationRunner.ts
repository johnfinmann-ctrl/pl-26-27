"use client";

import { useCallback, useEffect, useRef } from "react";
import { simulateSeason } from "@/lib/model/simulation/simulateSeason";
import type { SimulateSeasonInput } from "@/lib/model/simulation/simulateSeason";
import type { SimulationWorkerResponse } from "@/workers/simulation.worker";
import type { SeasonSimulation } from "@/types/domain";

/**
 * Kører Monte Carlo-sæsonsimuleringen (§9) i en Web Worker, så
 * beregningen ikke blokerer hovedtråden/UI'et på mobil. Falder sikkert
 * tilbage til hovedtråden, hvis Web Worker ikke understøttes i browseren
 * (fx meget gamle browsere eller visse indlejrede webviews).
 *
 * Deterministisk seed bevares uændret: samme input giver samme output,
 * uanset om beregningen kører i worker eller på hovedtråden (verificeret i
 * tests/simulation.test.ts, som kalder simulateSeason direkte).
 */
export function useSimulationRunner() {
  const workerRef = useRef<Worker | null>(null);
  const supportsWorker =
    typeof window !== "undefined" && typeof Worker !== "undefined";

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const getWorker = useCallback((): Worker | null => {
    if (!supportsWorker) return null;
    if (!workerRef.current) {
      try {
        // Bevidst en almindelig streng-sti til en precompileret, statisk
        // fil (public/workers/simulation-worker.js), IKKE
        // `new URL("./worker.ts", import.meta.url)`. Turbopack viste sig
        // ikke at bundle sidstnævnte pålideligt (serverede rå TypeScript
        // med forkert content-type), så workeren bygges i stedet separat
        // med esbuild via `npm run build:worker` (se scripts/build-worker.ts).
        workerRef.current = new Worker("/workers/simulation-worker.js");
      } catch {
        // Nogle miljøer (fx bestemte webviews eller ældre browsere) kan
        // kaste ved oprettelse af en worker. Sikker fallback til
        // hovedtråden i stedet for at fejle appen.
        return null;
      }
    }
    return workerRef.current;
  }, [supportsWorker]);

  const run = useCallback(
    (input: SimulateSeasonInput): Promise<SeasonSimulation> => {
      const worker = getWorker();

      if (!worker) {
        // Sikker fallback uden Web Worker: kør synkront på hovedtråden.
        return Promise.resolve(simulateSeason(input));
      }

      return new Promise((resolve, reject) => {
        const requestId =
          globalThis.crypto?.randomUUID?.() ??
          `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        function handleMessage(event: MessageEvent<SimulationWorkerResponse>) {
          if (event.data.requestId !== requestId) return;
          worker!.removeEventListener("message", handleMessage);
          worker!.removeEventListener("error", handleError);
          if (event.data.status === "success") {
            resolve(event.data.result);
          } else {
            reject(new Error(event.data.message));
          }
        }

        function handleError() {
          worker!.removeEventListener("message", handleMessage);
          worker!.removeEventListener("error", handleError);
          // Faldt tilbage til hovedtråden, hvis workeren selv fejler under kørsel.
          try {
            resolve(simulateSeason(input));
          } catch (err) {
            reject(err);
          }
        }

        worker.addEventListener("message", handleMessage);
        worker.addEventListener("error", handleError);
        worker.postMessage({ requestId, input });
      });
    },
    [getWorker]
  );

  return { run, supportsWorker };
}
