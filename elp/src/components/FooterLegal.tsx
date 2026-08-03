import { APP_VERSION, MODEL_VERSION_ID } from "@/lib/config/model-config";

export function FooterLegal() {
  return (
    <footer className="px-4 py-6 text-xs text-elp-muted border-t border-white/10 mt-10 mb-16 sm:mb-6">
      <p className="max-w-2xl">
        English League Predictor er en uafhængig analyseapp udviklet af
        Nordic Operations. Appen er ikke tilknyttet, godkendt af eller
        sponsoreret af Premier League, The FA eller de viste klubber.
        Prognoser er statistiske beregninger og ikke sikre resultater.
      </p>
      <p className="max-w-2xl mt-2">
        Appen er ikke en bettingtjeneste og giver ikke økonomisk rådgivning.
      </p>
      <p className="mt-2">Bygget af Nordic Operations · nordicoperations.dk</p>
      <p className="mt-1">
        App-version {APP_VERSION} · Model {MODEL_VERSION_ID}
      </p>
    </footer>
  );
}
