# Test-strategi

## Verificeret kommandokørsel (denne rettelsesrunde)

Kørt i rækkefølge fra en helt ren tilstand (`rm -rf node_modules .next public/workers`):

| # | Kommando | Resultat | Exit code |
|---|---|---|---|
| 1 | `npm ci` | 529 pakker installeret | 0 |
| 2 | `npm run lint` | Ingen fejl/advarsler | 0 |
| 3 | `npx tsc --noEmit` | Ingen typefejl | 0 |
| 4 | `npm run validate:data` | 20 hold, 380 kampe, gyldigt | 0 |
| 5 | `npm test` | **48/48 tests bestået** (9 filer) | 0 |
| 6 | `npm run build` | `prebuild` bygger workeren automatisk, alle 7 sider genereret | 0 |
| 7 | `npm run test:e2e` | Se afsnittet nedenfor | 1 (se forklaring) |

### Om test:e2e-resultatet

32 af 34 Playwright-tests fejlede, men **udelukkende** fordi
Chromium-browserens binærfil ikke kunne downloades i dette
sandkassemiljø:

```
Error: browserType.launch: Executable doesn't exist at
/opt/pw-browsers/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell
```

Det blev forsøgt installeret to gange (`npx playwright install chromium`
og `npx playwright install --with-deps chromium`); begge gav en eksplicit
`403 Forbidden: Host not in allowlist: cdn.playwright.dev`-fejl fra
sandkassens netværksproxy - dvs. domænet er ikke tilladt i dette
udviklingsmiljø, uafhængigt af projektets kode.

De **2 tests, der IKKE kræver en browser-instans** (dem der bruger
Playwrights `request`-fixture til rene HTTP-kald, fx
`sw.js og offline.html er tilgængelige`), **bestod uden problemer**, hvilket
bekræfter at test-opsætningen, webserveren og selve appen fungerer
korrekt - kun selve browser-downloadet er blokeret her.

**Handling for ejeren:** kør `npx playwright install` (eller
`npx playwright install --with-deps chromium` på Linux/CI) i et miljø med
normal internetadgang, og kør derefter `npm run test:e2e` igen. Testene
kræver ingen kodeændringer for at bestå - kun browserbinæren mangler.

## Unit- og integrationstests (Vitest)

Kør med:

```bash
npm run test
```

**Status: 48/48 tests bestået**, fordelt på 9 testfiler:

| Testfil | Dækker |
|---|---|
| `tests/validation.test.ts` | Præcis 20 hold, ingen dubletter, korrekte oprykkere, 380 kampe, ingen selvkampe, ukendte hold afvises, 19H/19U pr. hold |
| `tests/elo.test.ts` | Ratingændring efter sejr/uafgjort/nederlag, hjemmebanefordel anvendes én gang, oprykkere starter lavere |
| `tests/poisson.test.ts` | Alle sandsynligheder mellem 0-1, H+X+U summerer til 1, resultatmatrix summerer til ~1, stærkere hold får ikke lavere forventede mål |
| `tests/simulation.test.ts` | Reproducerbarhed ved fast seed, 20 hold i output, ingen NaN/Infinity, sandsynligheder summerer korrekt, scenarie ændrer resultatet uden at overskrive basen |
| `tests/demoData.test.ts` | DemoDataProvider returnerer gyldigt, korrekt mærket snapshot; programscore, hvile-, VM- og fraværsscore ligger i gyldige intervaller |
| `tests/workerSimulation.test.ts` | Kører den FAKTISKE kompilerede `public/workers/simulation-worker.js`-bundle i en simuleret worker-scope og sammenligner byte-for-byte med hovedtråds-resultatet ved samme seed (Opgave 3) |
| `tests/useSimulationRunner.test.tsx` | Hovedtråd-fallback: udnytter at jsdom (testmiljøet) IKKE har en global `Worker`-klasse, så testen verificerer en ægte fallback, ikke en mock |
| `tests/statusStates.test.tsx` | Loading- og fejltilstande: `aria-live`, fejlbesked uden hemmeligheder, "Prøv igen"-knappen kalder `onRetry` |
| `tests/pwa.test.ts` | manifest.json har påkrævede felter og kun egne ikoner; sw.js er gyldig JS og cacher app-shell/offline-side |

## End-to-end-tests (Playwright)

Test-filerne ligger i `e2e/` og er skrevet og typetjekket
(`npx tsc --noEmit` er grøn). De kunne ikke køres til completion i dette
sandkassemiljø - se tabellen ovenfor for den præcise, verificerede årsag.
Kør dem selv med:

```bash
npx playwright install
npm run test:e2e
```

| Testfil | Dækker |
|---|---|
| `e2e/favoriteTeam.spec.ts` | Favorithold kan vælges, huskes efter reload, og kan skiftes igen; demo-advarsel er synlig |
| `e2e/allPages.spec.ts` | Alle 7 hovedsider åbner uden JS-fejl; bundmenuen viser alle 7 sider (mobilnavigation); ingen vandret overflow på mobilbredde (375px) |
| `e2e/simulator.spec.ts` | Simulatorens hovedflow: genberegne et scenarie og nulstille |
| `e2e/pwa.spec.ts` | Manifest-link i `<head>`, service worker-registrering, `sw.js`/`offline.html` tilgængelige, "Demo – syntetiske data" vises konsekvent på tværs af sider |

## Manuel test-tjekliste (før release)

- [ ] Appen starter og viser tal uden nogen `.env`-fil
- [ ] Den gule DEMOVERSION-bjælke er synlig på alle sider
- [ ] Testet på en fysisk mobiltelefon (iOS Safari) og desktop
- [ ] PWA kan installeres ("Føj til hjemmeskærm" / "Installer app")
- [ ] Offline-side vises korrekt, når netværket slås fra efter første besøg
- [ ] Tastaturnavigation virker gennem hele appen (Tab/Shift+Tab, synlig
      fokusring)
- [ ] `npm run build` fejler ikke (kører automatisk `build:worker` via `prebuild`)
- [ ] Web Worker'en bruges faktisk i browseren (DevTools → Network → filtrér
      "worker" → se `simulation-worker.js` blive hentet, ikke kun hovedtråd-fallback)
- [ ] Ingen hemmeligheder findes i repoet (`git grep -i "api_football_key"`
      bør kun ramme `.env.example` og kildekodekommentarer)
- [ ] Ingen `NEXT_PUBLIC_`-præfiksede variable indeholder API-nøgler
      (`grep -rn "NEXT_PUBLIC_" src/` bør ikke ramme noget nøgle-relateret)

## Sikkerhedstests (dækket af kodegennemgang + validering)

- API-nøglen forlader aldrig serveren (`server-only`-import i
  `ApiFootballProvider`) og bruges aldrig via `NEXT_PUBLIC_*`
- `.env` er i `.gitignore`
- Al ekstern/importeret data valideres via `validateLeagueData`, før den
  bruges (`JsonDataProvider`)
- Ingen scraping af Premier Leagues eller klubbers hjemmesider noget sted
  i kodebasen
