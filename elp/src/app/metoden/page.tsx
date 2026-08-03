import { ModelStatusBadge } from "@/components/ModelStatusBadge";

export default function MetodenPage() {
  return (
    <section className="px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">Metoden</h1>

      <div className="rounded-xl bg-elp-card p-4">
        <h2 className="font-semibold mb-3">Hvad påvirker prognosen i V1?</h2>
        <ul className="space-y-2 text-sm mb-4">
          <FactorRow label="Elo-rating" status="active" />
          <FactorRow label="Hjemmebanefordel" status="active" />
          <FactorRow label="Poisson-målmodel" status="active" />
          <FactorRow label="Monte Carlo-sæsonsimulering" status="active" />
          <FactorRow label="Syntetisk kampprogram" status="active" />
        </ul>
        <p className="text-xs text-elp-muted mb-2">
          Følgende vises kun som forklarende/illustrative oplysninger og
          påvirker endnu ikke selve kampberegningen:
        </p>
        <ul className="space-y-2 text-sm">
          <FactorRow label="VM-belastning" status="illustrative" />
          <FactorRow label="Hviledage og juleprogram" status="illustrative" />
          <FactorRow label="Skader og øvrige fravær" status="illustrative" />
          <FactorRow label="Røde kort" status="illustrative" />
          <FactorRow label="Karantæner" status="illustrative" />
          <FactorRow label="VAR" status="illustrative" />
          <FactorRow label="Programstyrke (visning)" status="illustrative" />
        </ul>
      </div>

      <Explainer title="Elo-rating">
        Hvert hold har et Elo-tal, der stiger og falder efter resultater.
        Jo større forskel der er mellem to holds Elo-tal, jo mere
        favoriseret er det stærkeste hold – men Elo-tallet i sig selv er
        ikke en direkte vinderchance, kun et udgangspunkt for beregningen.
        Elo-parametrene i demoversionen er foreløbige og endnu ikke
        historisk valideret.
      </Explainer>

      <Explainer title="Poisson-fordeling">
        Ud fra Elo-forskellen beregner vi, hvor mange mål hvert hold
        forventes at score. Poisson-fordelingen bruges til at omsætte de
        forventede mål til sandsynligheder for alle resultater fra 0-0 til
        7 eller flere mål, og dermed til sandsynlighed for hjemmesejr,
        uafgjort og udesejr.
      </Explainer>

      <Explainer title="Monte Carlo-simulering">
        Vi spiller hele resten af sæsonen igennem tusindvis af gange i
        computeren – 10.000 gange i den interaktive demo. Hver gang trækkes
        et tilfældigt resultat for hver resterende kamp ud fra
        sandsynlighederne. Til sidst tæller vi, hvor ofte hvert hold ender
        på hver placering, og bruger det til at vise chancer for
        mesterskab, europapladser og nedrykning.
      </Explainer>

      <Explainer title="Programscore">
        Programscoren viser, om et holds kommende kampe er relativt lettere
        eller sværere sammenlignet med de andre 19 hold – baseret på
        modstandernes styrke og om kampene er hjemme eller ude. Scoren
        bruger ingen vilkårlige bonusser eller straffe.
      </Explainer>

      <Explainer title="Belastning">
        Hvile mellem kampe og illustrativ VM-belastning vises som
        baggrundsinformation. De påvirker endnu ikke selve
        sandsynlighedsberegningen i denne demoversion, da effekten ikke er
        valideret mod historiske data.
      </Explainer>

      <Explainer title="Kort, karantæner og VAR">
        Røde kort, karantæner og VAR vises udelukkende som informativ
        baggrund i V1 (§13/§14). Der laves ingen liveprognose efter et rødt
        kort, ingen forudsigelse af VAR-kendelser, og ingen vurdering af
        dommere som partiske. VAR er ikke en selvstændig numerisk faktor og
        gives aldrig som en vilkårlig holdbonus eller -straf.
      </Explainer>

      <Explainer title="Usikkerhed">
        Alle tal i appen er sandsynligheder og statistiske skøn – aldrig
        sikre resultater. Pointintervaller (10.-90. percentil) viser, hvor
        stor spredningen typisk er mellem simuleringerne. Prognoserne må
        ikke bruges til betting eller økonomiske beslutninger.
      </Explainer>

      <Explainer title="Demo kontra produktionsdata">
        Denne version bruger et syntetisk, tydeligt mærket testkampprogram
        og illustrative styrketal – ikke det officielle 2026/27-kampprogram
        eller aktuelle skader/karantæner. Når rigtige data kobles på senere,
        ændres beregningsmotoren ikke, kun datakilden.
      </Explainer>
    </section>
  );
}

function FactorRow({
  label,
  status,
}: {
  label: string;
  status: "active" | "illustrative";
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <ModelStatusBadge status={status} />
    </li>
  );
}

function Explainer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-elp-card p-4">
      <h2 className="font-semibold mb-1">{title}</h2>
      <p className="text-sm text-elp-text/90">{children}</p>
    </div>
  );
}
