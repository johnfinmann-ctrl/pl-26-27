import { poissonConfig } from "@/lib/config/model-config";

function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export function poissonPmf(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

export interface ExpectedGoals {
  expectedHomeGoals: number;
  expectedAwayGoals: number;
}

/**
 * Foreløbig, konfigurerbar afledning af forventede mål ud fra Elo-forskel.
 * Dette er en simpel, gennemsigtig baseline til V1 – ikke en videnskabeligt
 * valideret model. Stærkere hold får aldrig lavere forventede mål end
 * svagere hold uden en eksplicit hjemme/ude-forklaring.
 */
export function expectedGoalsFromElo(
  homeElo: number,
  awayElo: number
): ExpectedGoals {
  const diff = homeElo - awayElo;
  // Logistisk dæmpning så forskelle ikke eksploderer beregningen
  const strengthFactor = 1 / (1 + Math.exp(-diff / 400));

  const base = poissonConfig.leagueAverageGoalsPerTeam;
  const expectedHomeGoals =
    base + poissonConfig.homeAdvantageGoals + (strengthFactor - 0.5) * 2 * base;
  const expectedAwayGoals =
    base + (0.5 - strengthFactor) * 2 * base;

  return {
    expectedHomeGoals: Math.max(0.05, Math.round(expectedHomeGoals * 1000) / 1000),
    expectedAwayGoals: Math.max(0.05, Math.round(expectedAwayGoals * 1000) / 1000),
  };
}

export interface ScorelineDistribution {
  matrix: number[][]; // matrix[home][away], sidste indeks = "7 eller flere"
  homeWin: number;
  draw: number;
  awayWin: number;
  mostLikelyScoreline: { home: number; away: number; probability: number };
}

/**
 * Beregner fuld resultatfordeling 0-0 til mindst 7-7 (sidste bucket = "7+"),
 * samt normaliserede 1-X-2 sandsynligheder.
 */
export function scorelineDistribution(
  expectedHomeGoals: number,
  expectedAwayGoals: number
): ScorelineDistribution {
  const max = poissonConfig.maxGoalsExplicit; // 7
  const size = max + 1; // 0..7 (7 = "7 eller flere", tail-massed)

  const homeProbs: number[] = [];
  const awayProbs: number[] = [];
  for (let g = 0; g < max; g++) {
    homeProbs.push(poissonPmf(expectedHomeGoals, g));
    awayProbs.push(poissonPmf(expectedAwayGoals, g));
  }
  const homeTail = Math.max(0, 1 - homeProbs.reduce((a, b) => a + b, 0));
  const awayTail = Math.max(0, 1 - awayProbs.reduce((a, b) => a + b, 0));
  homeProbs.push(homeTail);
  awayProbs.push(awayTail);

  const matrix: number[][] = [];
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let best = { home: 0, away: 0, probability: -1 };

  for (let h = 0; h < size; h++) {
    matrix.push([]);
    for (let a = 0; a < size; a++) {
      const p = homeProbs[h] * awayProbs[a];
      matrix[h].push(p);
      if (h > a) homeWin += p;
      else if (h === a) draw += p;
      else awayWin += p;
      if (p > best.probability) best = { home: h, away: a, probability: p };
    }
  }

  // Normaliser så H+X+U summerer nøjagtigt til 1 (afrundingsfejl fra tail-bucket)
  const total = homeWin + draw + awayWin;
  homeWin /= total;
  draw /= total;
  awayWin /= total;

  return {
    matrix,
    homeWin,
    draw,
    awayWin,
    mostLikelyScoreline: best,
  };
}
