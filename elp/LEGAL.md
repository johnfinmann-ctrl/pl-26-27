# Juridisk afgrænsning

## Navn

Appens officielle navn og titel er **"English League Predictor"**.
"Premier League" bruges kun beskrivende i brødtekst — aldrig som appens
titel, logo eller branding.

## Ingen officiel tilknytning

English League Predictor er en uafhængig analyseapp udviklet af Nordic
Operations. Appen er ikke tilknyttet, godkendt af eller sponsoreret af
Premier League, The FA eller de viste klubber. Denne tekst vises i
footeren på hver side i appen.

## Ingen betting eller finansiel rådgivning

Appen er ikke en bettingtjeneste og giver ikke økonomisk rådgivning.
Prognoser er statistiske beregninger og ikke sikre resultater. Der findes
ingen bookmaker-links, betalingsflows eller odds nogen steder i appen.

## Grafik og branding

Denne kodebase indeholder og må ikke tilføjes:

- officielle klublogoer
- officielle trøjedesign
- spillerbilleder
- Premier League-trofæet eller andet officielt ligamateriale

I stedet bruges **neutrale holdmarkører**: en klubforkortelse i en enkel
cirkel med en selvvalgt, neutral appfarve (`src/components/TeamBadge.tsx`,
`src/lib/data/demo/clubs.ts`). App-ikonerne (`public/icons/`) er
egenproducerede bogstavikoner ("ELP"), ikke afledt af nogen klub- eller
ligagrafik.

Klubnavne bruges udelukkende som faktuelle identifikationer af de
deltagende hold, hvilket er nødvendigt for appens formål og ikke antyder
nogen tilknytning eller godkendelse.

## Persondata

V1 indsamler ingen personoplysninger. Det eneste, der gemmes, er et
valgfrit favorithold, gemt lokalt på brugerens egen enhed via
`localStorage` — aldrig sendt til en server. Der er intet login, ingen
cookies til markedsføring, og ingen kontaktformular.

## Ansvarsfraskrivelse

Alle sandsynligheder, prognoser og scores i appen er statistiske estimater
baseret på foreløbige, ikke-backtestede modeller (se `MODEL.md`). De må
ikke opfattes som garantier for fremtidige resultater og bør ikke bruges
som eneste grundlag for finansielle beslutninger af nogen art.
