# Test-strategi

## Unit- og integrationstests (Vitest)

Kør med:

```bash
npm run test
```

**Status: 32/32 tests bestået** (verificeret under udvikling af denne
V1).

| Testfil | Dækker |
|---|---|
| `tests/validation.test.ts` | Præcis 20 hold, ingen dubletter, korrekte oprykkere, 380 kampe, ingen selvkampe, ukendte hold afvises, 19H/19U pr. hold |
| `tests/elo.test.ts` | Ratingændring efter sejr/uafgjort/nederlag, hjemmebanefordel anvendes én gang, oprykkere starter lavere |
| `tests/poisson.test.ts` | Alle sandsynligheder mellem 0-1, H+X+U summerer til 1, resultatmatrix summerer til ~1, stærkere hold får ikke lavere forventede mål |
| `tests/simulation.test.ts` | Reproducerbarhed ved fast seed, 20 hold i output, ingen NaN/Infinity, sandsynligheder summerer korrekt, scenarie ændrer resultatet uden at overskrive basen |
| `tests/demoData.test.ts` | DemoDataProvider returnerer gyldigt, korrekt mærket snapshot; programscore, hvile-, VM- og fraværsscore ligger i gyldige intervaller |

## End-to-end-tests (Playwright)

Test-filerne ligger i `e2e/` og er skrevet og typetjekket
(`npx tsc --noEmit` er grøn), men kunne **ikke køres i det miljø, der
byggede denne V1**, fordi sandkassens netværksregler blokerede download af
Chromium fra `cdn.playwright.dev`. Kør dem selv med:

```bash
npx playwright install
npm run test:e2e
```

| Testfil | Dækker |
|---|---|
| `e2e/favoriteTeam.spec.ts` | Favorithold kan vælges, huskes efter reload, og kan skiftes igen |
| `e2e/allPages.spec.ts` | Alle 7 hovedsider åbner uden JS-fejl; bundmenuen viser alle 7 sider; ingen vandret overflow på mobilbredde (375px) |
| `e2e/simulator.spec.ts` | Simulatoren kan genberegne et scenarie og nulstilles korrekt |

## Manuel test-tjekliste (før release)

- [ ] Appen starter og viser tal uden nogen `.env`-fil
- [ ] Den gule DEMOVERSION-bjælke er synlig på alle sider
- [ ] Testet på en fysisk mobiltelefon (iOS Safari) og desktop
- [ ] PWA kan installeres ("Føj til hjemmeskærm" / "Installer app")
- [ ] Offline-side vises korrekt, når netværket slås fra efter første besøg
- [ ] Tastaturnavigation virker gennem hele appen (Tab/Shift+Tab, synlig
      fokusring)
- [ ] `npm run build` fejler ikke
- [ ] Ingen hemmeligheder findes i repoet (`git grep -i "api_football_key"`
      bør kun ramme `.env.example` og kildekodekommentarer)

## Sikkerhedstests (dækket af kodegennemgang + validering)

- API-nøglen forlader aldrig serveren (`server-only`-import i
  `ApiFootballProvider`)
- `.env` er i `.gitignore`
- Al ekstern/importeret data valideres via `validateLeagueData`, før den
  bruges (`JsonDataProvider`)
