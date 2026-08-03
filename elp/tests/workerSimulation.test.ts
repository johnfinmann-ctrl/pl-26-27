import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";
import { simulateSeason } from "@/lib/model/simulation/simulateSeason";
import { DEMO_TEAMS } from "@/lib/data/demo/clubs";
import { generateSyntheticFixtures } from "@/lib/data/demo/fixtures";
import { startingRatingFor } from "@/lib/model/elo/elo";

/**
 * Denne test kører den FAKTISKE, kompilerede public/workers/simulation-worker.js
 * -bundle (bygget af `npm run build:worker`) i en minimal simuleret
 * worker-scope, og sammenligner resultatet med et direkte kald til
 * simulateSeason() på hovedtråden med samme seed. De skal være identiske,
 * så vi ved, at flytningen til Web Worker ikke utilsigtet har ændret
 * beregningsresultatet, og at deterministisk seed er bevaret (Opgave 3).
 */
describe("Web Worker-simulation (kompileret bundle)", () => {
  let workerCode: string;

  beforeAll(() => {
    const workerPath = path.resolve(
      __dirname,
      "../public/workers/simulation-worker.js"
    );
    if (!fs.existsSync(workerPath)) {
      throw new Error(
        `Fandt ikke ${workerPath}. Kør "npm run build:worker" før denne test.`
      );
    }
    workerCode = fs.readFileSync(workerPath, "utf8");
  });

  function runInSimulatedWorkerScope(message: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const listeners: Record<string, (event: unknown) => void> = {};
      const fakeSelf = {
        addEventListener(type: string, fn: (event: unknown) => void) {
          listeners[type] = fn;
        },
        postMessage(data: unknown) {
          resolve(data);
        },
      };

      try {
        const fn = new Function("self", workerCode);
        fn(fakeSelf);
        if (!listeners.message) {
          reject(new Error("Workeren registrerede intet 'message'-listener."));
          return;
        }
        listeners.message({ data: message });
      } catch (err) {
        reject(err);
      }
    });
  }

  it("giver identisk resultat som hovedtråden for samme deterministiske seed", async () => {
    const fixtures = generateSyntheticFixtures(DEMO_TEAMS);
    const eloByTeam = new Map(
      DEMO_TEAMS.map((t) => [t.id, startingRatingFor(t.isPromoted)])
    );

    const input = {
      teams: DEMO_TEAMS,
      allFixtures: fixtures,
      playedResults: new Map(),
      eloByTeam,
      numberOfSimulations: 200,
      seed: 42,
    };

    const mainThreadResult = simulateSeason(input);

    const workerResponse = (await runInSimulatedWorkerScope({
      requestId: "req-1",
      input,
    })) as { requestId: string; status: string; result: typeof mainThreadResult };

    expect(workerResponse.requestId).toBe("req-1");
    expect(workerResponse.status).toBe("success");
    expect(workerResponse.result.outcomes).toEqual(mainThreadResult.outcomes);
  });

  it("returnerer 20 hold og ingen NaN/Infinity via workeren", async () => {
    const fixtures = generateSyntheticFixtures(DEMO_TEAMS);
    const eloByTeam = new Map(
      DEMO_TEAMS.map((t) => [t.id, startingRatingFor(t.isPromoted)])
    );

    const workerResponse = (await runInSimulatedWorkerScope({
      requestId: "req-2",
      input: {
        teams: DEMO_TEAMS,
        allFixtures: fixtures,
        playedResults: new Map(),
        eloByTeam,
        numberOfSimulations: 100,
        seed: 7,
      },
    })) as {
      status: string;
      result: { outcomes: { meanPoints: number }[] };
    };

    expect(workerResponse.status).toBe("success");
    expect(workerResponse.result.outcomes).toHaveLength(20);
    for (const outcome of workerResponse.result.outcomes) {
      expect(Number.isFinite(outcome.meanPoints)).toBe(true);
    }
  });

  it("returnerer en fejl-status i stedet for at kaste, hvis input er ugyldigt", async () => {
    const workerResponse = (await runInSimulatedWorkerScope({
      requestId: "req-3",
      input: {
        teams: null,
        allFixtures: null,
        playedResults: new Map(),
        eloByTeam: new Map(),
        numberOfSimulations: 10,
        seed: 1,
      },
    })) as { status: string; message?: string };

    expect(workerResponse.status).toBe("error");
    expect(typeof workerResponse.message).toBe("string");
  });
});
