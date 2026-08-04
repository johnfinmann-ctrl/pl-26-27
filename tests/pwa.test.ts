import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const publicDir = path.resolve(__dirname, "../public");

describe("PWA manifest", () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(publicDir, "manifest.json"), "utf8")
  );

  it("har de påkrævede felter til at være installérbar", () => {
    expect(manifest.name).toBe("English League Predictor");
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.background_color).toMatch(/^#/);
    expect(manifest.theme_color).toMatch(/^#/);
  });

  it("peger kun på egenproducerede, neutrale ikoner (ingen ekstern/officiel grafik)", () => {
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);
    for (const icon of manifest.icons) {
      expect(icon.src).toMatch(/^\/icons\//);
      expect(fs.existsSync(path.join(publicDir, icon.src))).toBe(true);
    }
  });

  it("har mindst ét maskable ikon i 512x512", () => {
    const has512Maskable = manifest.icons.some(
      (icon: { sizes: string; purpose?: string }) =>
        icon.sizes === "512x512" && icon.purpose === "maskable"
    );
    expect(has512Maskable).toBe(true);
  });
});

describe("Service worker", () => {
  const swSource = fs.readFileSync(path.join(publicDir, "sw.js"), "utf8");

  it("er gyldig, kørbar JavaScript", () => {
    expect(() => new Function(swSource)).not.toThrow();
  });

  it("registrerer install/activate/fetch-håndtering til offline-shell", () => {
    expect(swSource).toContain("addEventListener(\"install\"");
    expect(swSource).toContain("addEventListener(\"activate\"");
    expect(swSource).toContain("addEventListener(\"fetch\"");
  });

  it("cacher app-shell inkl. offline-fallback og manifest", () => {
    expect(swSource).toContain("/offline.html");
    expect(swSource).toContain("/manifest.json");
  });

  it("har en offline.html fallback-side på disk", () => {
    expect(fs.existsSync(path.join(publicDir, "offline.html"))).toBe(true);
  });
});
