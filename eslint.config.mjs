import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * `next lint` blev fjernet i Next.js 16. Dette er den anbefalede erstatning:
 * kør ESLint direkte. `eslint-config-next` (v16) eksporterer allerede native
 * flad ESLint-konfiguration, så FlatCompat/legacy .eslintrc-konvertering er
 * hverken nødvendig eller kompatibel (giver en cirkulær JSON-fejl, da
 * flade plugin-objekter ikke kan valideres som eslintrc-skemaer).
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
      "public/sw.js",
      "public/workers/**",
      "*.tsbuildinfo",
    ],
  },
  {
    rules: {
      // Web Worker-filen bruger `self`/postMessage i en ikke-DOM-kontekst;
      // dæmp til advarsel i stedet for hård fejl, hvor typer er svære at følge.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
