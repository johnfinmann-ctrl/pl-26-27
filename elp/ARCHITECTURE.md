# Arkitektur

## Overordnet struktur

```
src/
  types/domain.ts          Alle delte TypeScript-interfaces (§5 i specifikationen)
  lib/
    config/model-config.ts  Central, versioneret modelkonfiguration
    data/
      DataProvider.ts        Fælles adapter-interface + LeagueSnapshot
      demo/                   DemoDataProvider + syntetiske generatorer
      providers/              JsonDataProvider, ApiFootballProvider, SupabaseDataProvider
      selectDataProvider.ts   Vælger klient-provider (altid Demo i V1)
    model/
      elo/                    Elo-motor
      goals/                  Poisson-målmodel
      simulation/             Monte Carlo-sæsonsimulering + seedet RNG
      schedule/                Programscore
      fatigue/                 Hvile- og VM-belastningsscore
      absence/                 Fraværsscore
      validation/              Datavalidering (20 hold, 380 kampe, osv.)
    engine/
      buildLeagueView.ts       Orkestrerer data + alle modeller til ét view-objekt til UI
  components/                 Delte React-komponenter (nav, badges, statusvisning)
  hooks/                       useFavoriteTeam m.fl.
  app/                         Next.js App Router-sider (de 7 hovedsider)
```

## Lagdeling og afhængighedsretning

```
UI (app/*)
   │
   ▼
engine/buildLeagueView.ts   <- ren TS, ingen React-afhængighed
   │
   ├──> lib/model/*          <- rene, testbare funktioner
   └──> lib/data/*           <- adapter-interface, ingen direkte leverandørafhængighed
```

Beregningsmotoren (`lib/model`) importerer **aldrig** noget fra `lib/data`
eller `app`. Det betyder, at Elo/Poisson/simulation kan testes og
genbruges uafhængigt af, hvor data kommer fra.

`lib/data` afhænger kun af `types/domain.ts`. Alle leverandører
implementerer samme `DataProvider`-interface, så `buildLeagueView` (og
dermed hele UI'et) er fuldstændig uvidende om, om data kommer fra demo,
JSON, API-Football eller (senere) Supabase.

## Dataflow i V1

1. `LeagueDataProvider` (React context, `src/components/LeagueDataContext.tsx`)
   kalder `selectClientDataProvider()` → altid `DemoDataProvider` i browseren.
2. `DemoDataProvider.load()` genererer/validerer de 20 hold, 380 syntetiske
   kampe, spillere, fravær, kort og VM-belastning, og returnerer et
   `LeagueSnapshot`.
3. `buildLeagueView(snapshot)` beregner Elo-udgangspunkter, næste rundes
   1-X-2-sandsynligheder, en fuld sæsonsimulering, programscore for alle
   vinduer, samt hvile-/VM-/fraværsscore pr. hold.
4. De 7 sider abonnerer på dette via `useLeagueData()` og viser relevante
   udsnit.

## Hvorfor Next.js-adaptere er forberedt server-only

`ApiFootballProvider` importerer `server-only`, som fejler bevidst hvis
modulet nogensinde importeres i klientkode. Dette er en hård guard mod at
API-nøglen ved en fejl bliver bundlet til browseren (§7).

## Fremtidig udvidelse

- **Dixon-Coles**: implementér som en ny fil i `lib/model/goals/`, der
  eksporterer samme funktionssignatur som `scorelineDistribution`, og skift
  kaldet i `buildLeagueView.ts` — ingen ændringer i UI eller simulation
  nødvendige.
- **Dynamisk Elo i simulering**: `simulateSeason` tager allerede
  `eloByTeam` som parameter; en fremtidig variant kan opdatere dette map
  efter hver simuleret kamp i stedet for at holde det fastfrosset. Skal
  eksplicit slås til via `simulationConfig.useFrozenRatings`.
- **Supabase**: implementér `SupabaseDataProvider.load()` til at læse fra
  Supabase-tabeller, der matcher `LeagueSnapshot`-formen. Ingen ændring i
  engine eller UI.
- **Web Worker til simulering**: flyt `simulateSeason`-kaldet i
  `LeagueDataContext.tsx` og `simulator/page.tsx` til en Web Worker for at
  undgå at blokere hovedtråden på svage mobilenheder.
