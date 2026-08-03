# Changelog

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
