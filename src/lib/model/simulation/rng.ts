/**
 * Simpel, deterministisk pseudo-tilfældighedsgenerator (mulberry32),
 * så simuleringer kan reproduceres med et fast seed i tests (§9, §21).
 */
export function createRng(seed: number | null): () => number {
  if (seed === null) {
    // Ikke-deterministisk seed baseret på tidspunkt, til almindelig kørsel.
    seed = Date.now() ^ Math.floor(Math.random() * 0xffffffff);
  }
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Trækker et heltal fra en Poisson-fordeling med Knuth's algoritme.
 * Fin til vores formål (lave lambda-værdier, ~0-4 mål).
 */
export function samplePoisson(lambda: number, rng: () => number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L);
  return k - 1;
}
