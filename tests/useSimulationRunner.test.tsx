// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSimulationRunner } from "@/lib/simulation/useSimulationRunner";
import { simulateSeason } from "@/lib/model/simulation/simulateSeason";
import { DEMO_TEAMS } from "@/lib/data/demo/clubs";
import { generateSyntheticFixtures } from "@/lib/data/demo/fixtures";
import { startingRatingFor } from "@/lib/model/elo/elo";

/**
 * jsdom (test-miljøet her) har IKKE en global `Worker`-klasse, ligesom
 * visse ældre browsere/webviews. Det gør denne test til en ægte,
 * automatisk verificering af hovedtråd-fallbacken beskrevet i Opgave 3 -
 * ikke en mock, der lader som om Worker mangler.
 */
describe("useSimulationRunner - fallback uden Web Worker", () => {
  it("rapporterer at Web Worker ikke understøttes i jsdom-miljøet", () => {
    const { result } = renderHook(() => useSimulationRunner());
    expect(result.current.supportsWorker).toBe(false);
  });

  it("falder sikkert tilbage til hovedtråden og giver samme resultat som simulateSeason", async () => {
    const { result } = renderHook(() => useSimulationRunner());

    const fixtures = generateSyntheticFixtures(DEMO_TEAMS);
    const eloByTeam = new Map(
      DEMO_TEAMS.map((t) => [t.id, startingRatingFor(t.isPromoted)])
    );
    const input = {
      teams: DEMO_TEAMS,
      allFixtures: fixtures,
      playedResults: new Map(),
      eloByTeam,
      numberOfSimulations: 150,
      seed: 42,
    };

    let runnerResult: Awaited<ReturnType<typeof result.current.run>> | undefined;
    await act(async () => {
      runnerResult = await result.current.run(input);
    });

    const directResult = simulateSeason(input);

    expect(runnerResult?.outcomes).toEqual(directResult.outcomes);
  });
});
