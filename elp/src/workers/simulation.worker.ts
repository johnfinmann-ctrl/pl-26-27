/// <reference lib="webworker" />

import { simulateSeason } from "@/lib/model/simulation/simulateSeason";
import type { SimulateSeasonInput } from "@/lib/model/simulation/simulateSeason";

/**
 * Kører sæsonsimuleringen (§9) uden for browserens hovedtråd, så UI'et
 * forbliver responsivt, mens 10.000+ simuleringer beregnes. Maps
 * (eloByTeam, playedResults, overrides) er structured-cloneable og kan
 * sendes direkte via postMessage uden serialisering.
 */

interface SimulationRequest {
  requestId: string;
  input: SimulateSeasonInput;
}

interface SimulationSuccessResponse {
  requestId: string;
  status: "success";
  result: ReturnType<typeof simulateSeason>;
}

interface SimulationErrorResponse {
  requestId: string;
  status: "error";
  message: string;
}

export type SimulationWorkerResponse =
  | SimulationSuccessResponse
  | SimulationErrorResponse;

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener("message", (event: MessageEvent<SimulationRequest>) => {
  const { requestId, input } = event.data;

  try {
    const result = simulateSeason(input);
    const response: SimulationSuccessResponse = {
      requestId,
      status: "success",
      result,
    };
    ctx.postMessage(response);
  } catch (err) {
    const response: SimulationErrorResponse = {
      requestId,
      status: "error",
      message:
        err instanceof Error
          ? err.message
          : "Ukendt fejl under simulering i Web Worker.",
    };
    ctx.postMessage(response);
  }
});
