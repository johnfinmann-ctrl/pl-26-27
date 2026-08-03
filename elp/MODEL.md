# Modeldokumentation

**Alle parametre nævnt herunder er foreløbige og IKKE backtestet mod
historiske data.** De ligger samlet i `src/lib/config/model-config.ts`.

## Hvad påvirker prognosen i V1? (kort oversigt)

| Faktor | Status |
|---|---|
| Elo-rating | Indgår i modellen |
| Hjemmebanefordel | Indgår i modellen |
| Poisson-målmodel | Indgår i modellen |
| Monte Carlo-sæsonsimulering | Indgår i modellen |
| Syntetisk kampprogram | Indgår i modellen |
| Programstyrke (visning) | Illustrativ – påvirker ikke prognosen endnu |
| VM-belastning | Illustrativ – påvirker ikke prognosen endnu |
| Hviledage og juleprogram | Illustrativ – påvirker ikke prognosen endnu |
| Skader og øvrige fravær | Illustrativ – påvirker ikke prognosen endnu |
| Røde kort | Illustrativ – påvirker ikke prognosen endnu |
| Karantæner | Illustrativ – påvirker ikke prognosen endnu |
| VAR | Illustrativ – påvirker ikke prognosen endnu |

Denne tabel afspejles direkte i appens Metoden-side og som badges på
Overblik-, Program- og Hold-siderne, så det aldrig fremstår som om en
illustrativ faktor allerede indgår i beregningen.

## Elo-rating (`src/lib/model/elo/elo.ts`)

| Parameter | V1-værdi | Note |
|---|---|---|
| Startrating | 1500 | Standard Elo-udgangspunkt |
| Startrating, oprykkere | 1380 | Foreløbigt lavere, ikke valideret |
| Hjemmebanefordel | +60 Elo-point | Lagt til hjemmeholdets rating før forventet score beregnes |
| K-faktor | 20 | Skalerer hvor meget hver kamp flytter ratingen |
| Målmargin-loft | 1,75 | Dæmper effekten af meget store sejre |
| Regression mod middel | 25% af afstand til 1500 | Anvendes mellem sæsoner (endnu ikke koblet på i V1's UI) |

**Vigtigt:** Elo-forventet score (0-1) er IKKE det samme som en
1-X-2-sandsynlighed. Elo-beregningen kender ikke til uafgjort som
selvstændig udfald — det er en klassisk to-udfalds-konstruktion. Den
faktiske H/X/U-sandsynlighed kommer udelukkende fra Poisson-modellen.

## Poisson-målmodel (`src/lib/model/goals/poisson.ts`)

Forventede mål udledes af Elo-forskellen via en logistisk dæmpning, så
store ratingforskelle ikke giver urealistisk høje målforventninger.
Resultatmatrixen dækker 0-0 til 7-7, hvor "7" i hver retning er en
opsamlende hale ("7 eller flere").

Stærkere hold får aldrig lavere forventede mål end svagere hold uden en
eksplicit hjemme/ude-forklaring (testet i `tests/poisson.test.ts`).

**Dixon-Coles** er forberedt som fremtidig udvidelse (typisk justerer den
sandsynlighederne for lave resultater som 0-0, 1-0, 0-1, 1-1), men er
**ikke implementeret** i V1, fordi det ikke kunne valideres tilstrækkeligt
uden at risikere at gøre fundamentet ustabilt (jf. §8 i specifikationen).

## Monte Carlo-sæsonsimulering (`src/lib/model/simulation/`)

- 10.000 simuleringer i den interaktive demo, op til 50.000 muligt i en
  server-side batch (endnu ikke eksponeret i UI).
- Deterministisk seed (mulberry32-algoritme) understøttes til tests og
  reproducerbarhed.
- Hver simulering: spillede resultater lægges ind først (ingen i demoen),
  derefter simuleres hver resterende kamp ved at trække fra
  Poisson-fordelingen for begge hold, og tabellen genberegnes med korrekte
  tiebreaks (point → målforskel → scorede mål → indbyrdes opgør →
  alfabetisk som sidste udvej).
- **Fastfrosset rating**: Elo opdateres ikke undervejs i den enkelte
  simulering (`simulationConfig.useFrozenRatings = true`). Dynamisk Elo er
  forberedt i arkitekturen, men ikke aktiveret, da det kræver backtesting.
- **Web Worker**: Selve simuleringen (både den interaktive 10.000-kørsel
  og "Hvad nu hvis?"-scenarierne) kører i en Web Worker
  (`public/workers/simulation-worker.js`, kildekode i
  `src/workers/simulation.worker.ts`), så UI'et ikke blokeres. Der er en
  testet, sikker fallback til hovedtråden, hvis Web Worker ikke er
  tilgængelig. Se `tests/workerSimulation.test.ts` og
  `tests/useSimulationRunner.test.tsx` for verifikation af, at resultatet
  er identisk uanset hvor beregningen kører.

## Programscore (`src/lib/model/schedule/scheduleScore.ts`)

Baseret udelukkende på: modstanderens Elo-rating, hjemme/ude-status og
antal kampe i det valgte vindue. Normaliseres relativt til 0-100 på tværs
af de 20 hold — dvs. det sværeste program i ligaen får altid en værdi tæt
på 100, og det letteste tæt på 0, uanset de absolutte Elo-tal. Ingen
vilkårlige bonusser eller en subjektiv "motivationseffekt" indgår.

## Hvile-/VM-belastning (`src/lib/model/fatigue/`)

Illustrativ, informativ score. `worldCupLoadConfig.affectsMatchProbability`
og `fatigueConfig.affectsMatchProbability` er begge `false` — de påvirker
IKKE kampsandsynlighederne i V1. VM-belastningen beregnes som et
minutvægtet gennemsnit på spillerniveau (ikke en simpel sum), så et hold
med god trupbredde ikke automatisk får en ekstrem score.

## Fraværsscore (`src/lib/model/absence/absenceScore.ts`)

Ligeledes kun forklarende (`absenceConfig.affectsMatchProbability = false`).
Vægter spillerens betydning og forventede minutandel for hver aktive
fraværshændelse.

## Sæsonsimulator ("Hvad nu hvis?")

Scenarier i simulatoren (`src/app/simulator/page.tsx`) sender en
`overrides`-Map til `simulateSeason`, der tvinger et specifikt resultat i
én kamp. Dette overskriver ALDRIG basismodellen — hver simulator-kørsel
bygger en ny, uafhængig sæsonsimulering (verificeret i
`tests/simulation.test.ts`).
