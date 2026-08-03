import { build } from "esbuild";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

/**
 * Precompilerer Web Worker'en til én selvstændig, ren JavaScript-fil i
 * public/workers/. Dette er nødvendigt, fordi Turbopack (Next.js 16's
 * standard-bundler) ikke pålideligt understøtter mønsteret
 * `new Worker(new URL("./worker.ts", import.meta.url))` - i test viste
 * det sig, at Turbopack serverede rå, ukompileret TypeScript for denne
 * URL i stedet for at bundle den (Content-Type: video/mp2t), hvilket
 * ville fejle i enhver rigtig browser.
 *
 * Løsningen: byg workeren separat med esbuild til en almindelig statisk
 * fil, og referer den i klientkoden som en almindelig streng-URL
 * (new Worker("/workers/simulation-worker.js")), uden om bundler-magi.
 *
 * Køres automatisk via predev/prebuild/pretest:e2e i package.json, så
 * filen altid er frisk.
 */
async function main() {
  await build({
    entryPoints: [path.join(projectRoot, "src/workers/simulation.worker.ts")],
    outfile: path.join(projectRoot, "public/workers/simulation-worker.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2020",
    minify: true,
    sourcemap: false,
    tsconfig: path.join(projectRoot, "tsconfig.json"),
    logLevel: "info",
  });
  console.log("✓ Web Worker bygget til public/workers/simulation-worker.js");
}

main().catch((err) => {
  console.error("✗ Kunne ikke bygge simulation-worker.js:", err);
  process.exit(1);
});
