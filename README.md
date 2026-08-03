# English League Predictor

*Sandsynligheder, programstyrke og sæsonscenarier*

Udviklet af Nordic Operations.

## Hvad appen gør

English League Predictor er en uafhængig, mobilvenlig prognoseapp for
Premier League 2026/27. Den kombinerer:

- **Elo-rating** pr. hold (foreløbig, ikke-backtestet)
- **Poisson-målmodel** til 1-X-2-sandsynligheder og resultatfordeling
- **Monte Carlo-sæsonsimulering** (10.000 simuleringer interaktivt) til
  forventet tabel, pointintervaller og chancer for mesterskab, europæiske
  pladser og nedrykning
- **Programscore** (relativ programsværhed mellem de 20 hold)
- Illustrativ **hvile-/VM-belastning** og **fraværsscore** (kun
  forklarende i V1)
- En **"Hvad nu hvis?"-simulator** til at afprøve scenarier uden at ændre
  basismodellen

Appen viser altid sandsynligheder og usikkerhed — aldrig prognoser som
sikre resultater.

## Hvad V1 IKKE gør

- Ingen login, ingen personoplysninger, ingen betaling
- Ingen bookmaker-integration eller økonomisk rådgivning
- Ingen officielle klublogoer, trøjedesign eller Premier League-grafik
- Ingen automatisk liveopdatering eller scraping
- Ingen aktiv effekt af VM-belastning, fravær eller VAR på
  kampsandsynlighederne (kun forklarende visning, indtil valideret)
- Ingen rigtig tilkobling til API-Football eller Supabase (forberedt, men
  ikke aktiveret)

## Hurtig start

```bash
npm install
npm run dev
```

Appen kører på `http://localhost:3000` og fungerer **uden nogen
API-nøgle** — den bruger automatisk `DemoDataProvider`.

### Kør tests

```bash
npm run test        # Vitest (enheds- og integrationstests)
npm run test:e2e     # Playwright (kræver `npx playwright install` først)
```

### Byg til produktion

```bash
npm run build
npm run start
```

## Sådan virker demo-data

V1 leverer et lokalt, syntetisk demo-datasæt, så appen altid virker uden
en API-nøgle:

- De korrekte 20 klubber for 2026/27 (inkl. oprykkerne Coventry City, Hull
  City og Ipswich Town)
- Et **syntetisk, tydeligt mærket** testkampprogram (dobbelt round-robin,
  380 kampe) — **ikke** det officielle 2026/27-kampprogram
- Illustrative spillere, skader, karantæner og VM-belastningsdata

Alt demo-data er mærket `dataQuality: "synthetic"` og vises bag en gul
"DEMOVERSION"-bjælke i hele appen.

## Sådan kobles rigtig data på senere

Beregningsmotoren (Elo, Poisson, simulation, programscore) er fuldstændig
adskilt fra dataleverandøren via et adapter-interface
(`src/lib/data/DataProvider.ts`). Der findes fire adaptere:

| Adapter | Status i V1 |
|---|---|
| `DemoDataProvider` | Aktiv — standard, kræver ingen nøgle |
| `JsonDataProvider` | Klar til brug med importeret/manuel JSON |
| `ApiFootballProvider` | Forberedt server-only stub, ikke aktiveret |
| `SupabaseDataProvider` | Forberedt stub, ikke tilkoblet |

Se `ARCHITECTURE.md` og `DATA_SOURCES.md` for detaljer.

For at aktivere API-Football senere: kopiér `.env.example` til `.env`,
udfyld `API_FOOTBALL_KEY`, og implementér hentningen i
`ApiFootballProvider.load()`. Beregningsmotoren skal ikke ændres.

## Vercel-deployment

1. Push projektet til GitHub.
2. Importér repoet i Vercel.
3. Sæt evt. `API_FOOTBALL_KEY` som en **server-side** miljøvariabel i
   Vercel (ikke `NEXT_PUBLIC_`-præfiks) — men det er valgfrit, appen
   virker fint uden.
4. Deploy. Ingen build-konfiguration er nødvendig ud over standard
   Next.js.

## Hvilke beregninger er foreløbige

Se `MODEL.md` for den fulde gennemgang. Kort opsummeret er **alle**
model-parametre (Elo-startværdier, K-faktor, hjemmebanefordel,
Poisson-baseline m.fl.) foreløbige og ikke-backtestede. De ligger samlet i
`src/lib/config/model-config.ts`.

## Prognoser er ikke sikre resultater

Appen er ikke en bettingtjeneste og giver ikke økonomisk rådgivning. Alle
tal er statistiske skøn med usikkerhed. Se `LEGAL.md`.

## Kendte begrænsninger i V1 (se også CHANGELOG.md)

- Klient-side Monte Carlo-simulering med 10.000 simuleringer tager
  ca. 1-4 sekunder afhængigt af enhed. En Web Worker-baseret
  baggrundskørsel er den naturlige næste optimering for jævnere
  mobiloplevelse.
- Playwright-browserne kunne ikke installeres i udviklingsmiljøet, der
  byggede denne V1 (netværksrestriktioner mod `cdn.playwright.dev`).
  E2E-testene er skrevet og typetjekket, men skal køres første gang med
  `npx playwright install` i et miljø med normal internetadgang (fx CI
  eller din egen maskine).
- Dixon-Coles-modellen er forberedt som interface, men ikke implementeret
  — V1 bruger udelukkende Poisson.
- Dynamisk Elo (opdateret løbende gennem sæsonsimuleringen) er ikke
  aktiveret; V1 bruger fastfrosset rating i hver simulering, som krævet.
