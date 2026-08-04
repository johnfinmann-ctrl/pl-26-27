# English League Predictor

*Sandsynligheder, programstyrke og sæsonscenarier*

Udviklet af Nordic Operations.

> **Status:** Teknisk rettelsesrunde gennemført. Produktions-build,
> TypeScript-kontrol, ESLint og alle 48 automatiske tests består. Se
> `TESTING.md` for den fulde, verificerede kommandokørsel og
> `CHANGELOG.md` for hvad der er ændret.

## Hvad appen kan nu

- **Elo-rating** pr. hold (foreløbig, ikke-backtestet), **Poisson-målmodel**
  til 1-X-2-sandsynligheder, og **Monte Carlo-sæsonsimulering**
  (10.000 simuleringer) til forventet tabel, pointintervaller og chancer
  for mesterskab, europæiske pladser og nedrykning.
- Sæsonsimuleringen kører i en **Web Worker**, så UI'et forbliver
  responsivt på mobil, mens beregningen pågår - med synlig status ("Kører
  10.000 simuleringer i baggrunden …") og en sikker, testet fallback til
  hovedtråden, hvis Web Worker ikke understøttes.
- **Programscore** (relativ programsværhed mellem de 20 hold).
- Illustrativ **hvile-/VM-belastning**, **fraværsscore** og
  **kort/karantæner** - alle tydeligt badge-mærket "Illustrativ – påvirker
  ikke prognosen endnu", så det aldrig fremstår som om de allerede
  påvirker beregningen.
- En **"Hvad nu hvis?"-simulator** til at afprøve scenarier (også
  Web Worker-baseret) uden at ændre basismodellen.
- Konsekvent "Demo – syntetiske data"-mærkning og forbehold ("ikke
  Premier Leagues officielle kampprogram", "ikke egnet til betting eller
  økonomiske beslutninger") på tværs af alle syv hovedsider.

Appen viser altid sandsynligheder og usikkerhed — aldrig prognoser som
sikre resultater.

## Hvad der stadig er demo

- Kampprogrammet er syntetisk testdata (dobbelt round-robin), **ikke**
  det officielle 2026/27-kampprogram.
- Spillere, skader, karantæner og VM-belastning er illustrative
  demo-data, ikke virkelige hændelser.
- VM-belastning, hviledage/juleprogram, skader/fravær, røde kort,
  karantæner og VAR påvirker endnu ikke selve kampberegningen - kun Elo,
  hjemmebanefordel, Poisson og Monte Carlo-simuleringen gør (se
  `MODEL.md` og appens Metoden-side for den fulde oversigt).
- API-Football- og Supabase-adapterne er sikre, forberedte stubs - ikke
  funktionelt tilkoblet nogen rigtig datakilde.

## Hurtig start

```bash
npm install
npm run dev
```

`predev` bygger automatisk Web Worker-bundlen
(`public/workers/simulation-worker.js`) før serveren starter. Appen kører
på `http://localhost:3000` og fungerer **uden nogen API-nøgle eller
Supabase-opsætning** — den bruger automatisk `DemoDataProvider`.

### Kør tests

```bash
npm run lint          # ESLint (Next.js 16 + TypeScript flad konfiguration)
npx tsc --noEmit       # Typekontrol
npm run validate:data  # Validerer demo-datasættet (20 hold, 380 kampe)
npm test               # Vitest - 48 unit-/integrationstests
npm run test:e2e       # Playwright (kræver `npx playwright install` først)
```

### Byg til produktion

```bash
npm run build   # kører automatisk build:worker via prebuild
npm run start
```

## Miljøvariable

| Variabel | Påkrævet? | Beskrivelse |
|---|---|---|
| `API_FOOTBALL_KEY` | Nej | Kun server-side. Uden den bruger appen automatisk `DemoDataProvider`. Se `.env.example`. |

Der kræves **ingen** Supabase-projekt eller betalt API for at køre
demoversionen. Ingen variabel med `NEXT_PUBLIC_`-præfiks bruges til
hemmeligheder noget sted i projektet.

## Sådan virker demo-data

V1 leverer et lokalt, syntetisk demo-datasæt, så appen altid virker uden
en API-nøgle:

- De korrekte 20 klubber for 2026/27 (inkl. oprykkerne Coventry City, Hull
  City og Ipswich Town)
- Et **syntetisk, tydeligt mærket** testkampprogram (dobbelt round-robin,
  380 kampe) — **ikke** det officielle 2026/27-kampprogram
- Illustrative spillere, skader, karantæner og VM-belastningsdata

Alt demo-data er mærket `dataQuality: "synthetic"` og vises bag en gul
"DEMOVERSION"-bjælke samt "Demo – syntetiske data"-badges i hele appen.

## Sådan kobles rigtig data på senere

Beregningsmotoren (Elo, Poisson, simulation, programscore) er fuldstændig
adskilt fra dataleverandøren via et adapter-interface
(`src/lib/data/DataProvider.ts`). Der findes fire adaptere:

| Adapter | Status i V1 |
|---|---|
| `DemoDataProvider` | Aktiv — standard, kræver ingen nøgle |
| `JsonDataProvider` | Klar til brug med importeret/manuel JSON |
| `ApiFootballProvider` | Forberedt server-only stub, ikke aktiveret. Se den konkrete TODO-liste med 7 punkter i `src/lib/data/providers/ApiFootballProvider.ts` for hvad der mangler (officielt kampprogram, resultater, fravær, karantæner, datastatus, cache, rettigheder). |
| `SupabaseDataProvider` | Forberedt stub, ikke tilkoblet |

Se `ARCHITECTURE.md` og `DATA_SOURCES.md` for detaljer.

For at aktivere API-Football senere: kopiér `.env.example` til `.env`,
udfyld `API_FOOTBALL_KEY` (kun server-side, aldrig `NEXT_PUBLIC_`), og
implementér hentningen i `ApiFootballProvider.load()`. Beregningsmotoren
skal ikke ændres.

## Vercel-deployment

1. Push projektet til GitHub (node_modules, .next, og genererede
   worker-/testfiler er allerede i `.gitignore`).
2. Importér repoet i Vercel.
3. Sæt evt. `API_FOOTBALL_KEY` som en **server-side** miljøvariabel i
   Vercel (ikke `NEXT_PUBLIC_`-præfiks) — men det er valgfrit, appen
   virker fint uden, og kræver hverken Supabase eller et betalt API.
4. Deploy. Vercels standard build-kommando (`npm run build`) kører
   automatisk `build:worker` via `prebuild`, så Web Worker-bundlen altid
   er frisk - ingen ekstra build-konfiguration nødvendig.

## Hvilke beregninger er foreløbige

Se `MODEL.md` for den fulde gennemgang og Metoden-siden i appen for en
badge-markeret oversigt over, hvad der rent faktisk indgår i
beregningen ("Indgår i modellen") over for hvad der kun vises som
forklarende kontekst ("Illustrativ – påvirker ikke prognosen endnu").
Kort opsummeret er **alle** model-parametre (Elo-startværdier, K-faktor,
hjemmebanefordel, Poisson-baseline m.fl.) foreløbige og
ikke-backtestede. De ligger samlet i `src/lib/config/model-config.ts`.

## Prognoser er ikke sikre resultater

Appen er ikke en bettingtjeneste og giver ikke økonomisk rådgivning. Alle
tal er statistiske skøn med usikkerhed. Se `LEGAL.md`.

## Kendte begrænsninger i V1 (se også CHANGELOG.md)

- Playwright-browserne kunne ikke installeres i det sandkassemiljø, der
  udførte denne rettelsesrunde (netværksrestriktioner mod
  `cdn.playwright.dev`, bekræftet med to separate installationsforsøg).
  E2E-testene er skrevet, typetjekket, og de 2 tests, der ikke kræver en
  browser-instans, bestod og bekræftede at opsætningen virker. Kør
  `npx playwright install && npm run test:e2e` i et miljø med normal
  internetadgang for at få de resterende 32 kørt.
- Dixon-Coles-modellen er forberedt som interface, men ikke implementeret
  — V1 bruger udelukkende Poisson.
- Dynamisk Elo (opdateret løbende gennem sæsonsimuleringen) er ikke
  aktiveret; V1 bruger fastfrosset rating i hver simulering, som krævet.
- Web Worker-bundlen bygges separat med esbuild (`npm run build:worker`,
  koblet på via `predev`/`prebuild`/`pretest:e2e`), fordi Turbopack i
  denne Next.js 16-version ikke pålideligt kompilerer mønsteret
  `new Worker(new URL("./worker.ts", import.meta.url))` - se
  `scripts/build-worker.ts` for den fulde forklaring og verifikation.
