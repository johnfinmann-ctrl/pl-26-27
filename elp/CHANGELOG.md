# Changelog

## v0.2.0-demo — Teknisk rettelsesrunde

Kvalitetssikring og hærdning af V1 på brugerens anmodning. Ingen ændringer
i det grundlæggende design eller beregningsmotoren - kun rettelser,
robusthed og gennemsigtighed.

### Rettet

- **Lint**: `next lint` (fjernet i Next.js 16) erstattet med en native
  ESLint 9 flad konfiguration (`eslint.config.mjs`) baseret på
  `eslint-config-next`s egne flade eksporter. Fandt og rettede tre reelle
  React-fejl undervejs: to `set-state-in-effect`-brud
  (`LeagueDataContext`, `useFavoriteTeam` - sidstnævnte omskrevet til
  `useSyncExternalStore`) og ét `refs`-brud (ref muteret under render).
  `npm run lint` afslutter nu med exit code 0.
- **Oprydning**: Fjernet en fejlskabt, bogstaveligt brace-navngivet mappe
  (opstået fordi et tidligere `mkdir -p`-kald kørte i en shell uden
  brace-udvidelse), `tsconfig.tsbuildinfo`, `.next` og andre genererede
  filer. `.gitignore` udvidet med `*.tsbuildinfo`, Playwright-output m.m.
- **Web Worker-bug**: Opdagede ved et rigtigt produktions-build og en
  kørende server, at `new Worker(new URL("./worker.ts", import.meta.url))`
  IKKE blev kompileret korrekt af Turbopack i denne Next.js 16-opsætning -
  browseren ville have fået rå, ukompileret TypeScript serveret med forkert
  Content-Type. Løst ved at precompilere workeren separat med esbuild til
  `public/workers/simulation-worker.js` (kildekode i
  `src/workers/simulation.worker.ts`), koblet på build-processen via
  `predev`/`prebuild`/`pretest:e2e` i `package.json`.
- **Recharts**: Opgraderet fra 2.x (udfaset) til 3.10.1. Én
  typefejl rettet (Tooltip-formatter). Diagrammet på Hold-siden verificeret
  uændret i produktions-build.

### Tilføjet

- 10.000 Monte Carlo-simuleringer og "Hvad nu hvis?"-scenarier kører nu i
  en Web Worker (`useSimulationRunner`-hook) i stedet for at blokere
  hovedtråden, med synlig status og en testet, sikker fallback til
  hovedtråden.
- Konsekvent "Demo – syntetiske data"-mærkning og forbehold ("ikke
  Premier Leagues officielle kampprogram", "ikke egnet til betting eller
  økonomiske beslutninger") på tværs af alle syv hovedsider.
- `ModelStatusBadge`-komponent ("Indgår i modellen" /
  "Illustrativ – påvirker ikke prognosen endnu") anvendt konsekvent på
  Overblik, Program, Hold og Metoden, samt en samlet oversigtstabel i
  `MODEL.md` og øverst på Metoden-siden.
- Kort- og karantænevisning på Hold-siden (var slet ikke vist i V1, selvom
  datamodellen understøttede det) med eksplicit §13/§14-forbehold (ingen
  liveprognose efter rødt kort, ingen VAR-forudsigelse, ingen
  dommervurdering).
- Konkret 7-punkts TODO-liste i `ApiFootballProvider` for, hvad der
  mangler for at koble officielt kampprogram, resultater, spillerfravær
  og karantæner på.
- 16 nye automatiske tests (`workerSimulation.test.ts`,
  `useSimulationRunner.test.tsx`, `statusStates.test.tsx`, `pwa.test.ts`)
  samt en ny E2E-suite (`e2e/pwa.spec.ts`) for manifest, service worker og
  demo-mærkning. Samlet **48/48 Vitest-tests bestået**.

### Verificeret (fuld kommandokørsel, se TESTING.md)

`npm ci` → `npm run lint` → `npx tsc --noEmit` → `npm run validate:data` →
`npm test` → `npm run build`: alle exit code 0. `npm run test:e2e`: 2/34
tests bestod (dem uden browserkrav); de resterende 32 fejlede
udelukkende pga. et blokeret netværksdomæne i sandkassemiljøet
(`cdn.playwright.dev`), bekræftet med to separate installationsforsøg -
ikke en kodefejl.

### Kendte begrænsninger (uændret fra V1, medmindre andet er nævnt)

- Playwright-browsere skal installeres manuelt i et miljø med normal
  internetadgang (se TESTING.md for præcis fejlbesked og forklaring).
- Dixon-Coles-model og dynamisk Elo er forberedt i arkitekturen, men ikke
  aktiveret — kræver backtesting først.
- API-Football- og Supabase-adaptere er stubs, ikke funktionelt forbundet
  til noget (se den nye TODO-liste for konkrete næste skridt).

---

## v0.1.0-demo — V1

Første komplette V1-demo af English League Predictor.

### Tilføjet

- Projektskelet: Next.js 16.2.12, React 19, TypeScript (strict), Tailwind
  CSS 4, Vitest, Playwright.
- Fulde domænetyper (§5) og central, versioneret modelkonfiguration.
- De 20 korrekte klubber for 2026/27 inkl. oprykkere; fuld datavalidering
  (20 hold, ingen dubletter, ingen selvkampe, 380 kampe, 19H/19U pr. hold).
- Beregningsmotor: Elo, Poisson-målmodel, Monte Carlo-sæsonsimulering
  (deterministisk seed, korrekte tiebreaks, scenarie-isolering),
  Programscore, illustrativ hvile-/VM-belastningsscore, foreløbig
  fraværsscore.
- Adapterlag: `DemoDataProvider` (aktiv), `JsonDataProvider`,
  `ApiFootballProvider` (server-only stub), `SupabaseDataProvider` (stub).
- Syv hovedsider: Overblik, Næste runde, Prognose, Program, Hold,
  Simulator ("Hvad nu hvis?"), Metoden.
- Favorithold gemt lokalt (`localStorage`), intet login.
- PWA: manifest, egenproducerede ikoner, service worker, offline-side,
  installérbar.
- Tilgængelighed: skip-link, synlig fokusring, ARIA-labels, respekt for
  `prefers-reduced-motion`, WCAG AA-kontrast verificeret for
  farvepaletten, farve er aldrig eneste informationsbærer.
- 32 Vitest-tests (alle bestået) og tre Playwright E2E-testsuiter
  (skrevet og typetjekket).
- Dokumentation: README, ARCHITECTURE, MODEL, DATA_SOURCES, LEGAL,
  TESTING, `.env.example`.

### Kendte begrænsninger

- 10.000 klient-side simuleringer tager ca. 1-4 sekunder — bør flyttes til
  en Web Worker i en fremtidig version for jævnere mobiloplevelse.
- Playwright-browsere kunne ikke installeres i byggemiljøet
  (netværksbegrænsning); testene er klar til at køre i CI eller lokalt.
- Dixon-Coles-model og dynamisk Elo er forberedt i arkitekturen, men ikke
  aktiveret — kræver backtesting først.
- API-Football- og Supabase-adaptere er ikke funktionelt implementeret,
  kun forberedt som stubs bag adapter-interfacet.
