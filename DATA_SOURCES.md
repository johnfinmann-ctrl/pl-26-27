# Datakilder

## V1 (denne demo)

| Kilde | Status | Beskrivelse |
|---|---|---|
| `DemoDataProvider` | **Aktiv** | Lokalt genereret syntetisk datasæt. Kræver ingen API-nøgle. |

Demo-datasættet indeholder:

- **20 klubber** for sæsonen 2026/27 (§4 i specifikationen), inkl.
  oprykkerne Coventry City, Hull City og Ipswich Town.
- **380 syntetiske kampe** genereret med en standard "circle method"
  dobbelt round-robin (19 hjemme- og 19 udekampe pr. hold). Dette er
  **ikke** det officielle 2026/27-kampprogram — kampdatoer er markeret
  som foreløbige, og runderne er generiske testrunder.
- **Illustrative spillere** (4 pr. hold: GK/DF/MF/FW) med tilfældige, men
  deterministiske, betydningsværdier.
- **Et lille udvalg illustrative skader/karantæner/kort/VM-belastninger**,
  tydeligt mærket `dataQuality: "synthetic"`.

Alt data har `verificationStatus: "not-applicable"` og
`source: "demo"`, så det aldrig kan forveksles med rigtige,
produktionsverificerede data.

## Forberedte, ikke-aktiverede kilder

| Kilde | Status | Beskrivelse |
|---|---|---|
| `JsonDataProvider` | Klar til brug | Indlæser og validerer et `LeagueSnapshot`-kompatibelt JSON-objekt, fx en manuelt vedligeholdt lokal fil (bruges til fravær, jf. §12). |
| `ApiFootballProvider` | Forberedt, server-only stub | Kræver `API_FOOTBALL_KEY` (kun server-side, se `.env.example`). Kaster i øjeblikket en fejl, hvis den kaldes, fordi den ikke er implementeret endnu. |
| `SupabaseDataProvider` | Forberedt stub | Ikke tilkoblet noget Supabase-projekt i V1. |

## Sikkerhed omkring API-nøgler

- `API_FOOTBALL_KEY` læses udelukkende i `ApiFootballProvider`, som
  importerer `server-only` og derfor ikke kan bundles til klienten ved en
  fejl.
- Nøglen logges aldrig, sendes aldrig til browseren, og indgår aldrig i
  fejlmeddelelser.
- `.env` er tilføjet til `.gitignore`. `.env.example` indeholder kun et
  tomt felt.
- Hvis nøglen mangler, falder appen automatisk tilbage til
  `DemoDataProvider` (se `selectClientDataProvider` og
  `ApiFootballProvider.load()`).

## Ingen scraping

Der er ikke, og må ikke, implementeres scraping af Premier Leagues eller
klubbers officielle hjemmesider noget sted i denne kodebase.

## Datastatus-koder vist i UI

`Demo` · `Importeret` · `API-opdateret` · `Forældet` · `Fejl` ·
`Delvist verificeret` — se `dataStatusLabels` i
`src/lib/config/model-config.ts` og `DataStatusBadge`-komponenten.
