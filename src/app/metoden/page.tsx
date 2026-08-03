export default function MetodenPage() {
  return (
    <section className="px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">Metoden</h1>

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

      <Explainer title="Usikkerhed">
        Alle tal i appen er sandsynligheder og statistiske skøn – aldrig
        sikre resultater. Pointintervaller (10.-90. percentil) viser, hvor
        stor spredningen typisk er mellem simuleringerne.
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

function Explainer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-elp-card p-4">
      <h2 className="font-semibold mb-1">{title}</h2>
      <p className="text-sm text-elp-text/90">{children}</p>
    </div>
  );
}
