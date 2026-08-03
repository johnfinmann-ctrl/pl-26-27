/**
 * Viser tydeligt, om en given faktor rent faktisk indgår i beregningen af
 * kampsandsynligheder/sæsonprognosen, eller om den kun vises som
 * forklarende/illustrativ information i V1. Må ikke forveksles med
 * dataQuality (synthetic/unverified) - denne badge handler udelukkende om
 * INDFLYDELSE på prognosen, ikke om dataens ægthed.
 */
export function ModelStatusBadge({
  status,
}: {
  status: "active" | "illustrative";
}) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center rounded-full bg-elp-green px-2 py-0.5 text-xs font-medium text-elp-bg">
        Indgår i modellen
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-elp-purple px-2 py-0.5 text-xs font-medium text-elp-bg">
      Illustrativ – påvirker ikke prognosen endnu
    </span>
  );
}
