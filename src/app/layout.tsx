import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LeagueDataProvider } from "@/components/LeagueDataContext";
import { DemoWarningBanner } from "@/components/DemoWarningBanner";
import { BottomNav } from "@/components/BottomNav";
import { FooterLegal } from "@/components/FooterLegal";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "English League Predictor",
  description: "Sandsynligheder, programstyrke og sæsonscenarier",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ELP",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1220",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body className="min-h-dvh bg-elp-bg text-elp-text antialiased">
        <ServiceWorkerRegister />
        <a href="#main-content" className="skip-link">
          Spring til indhold
        </a>
        <DemoWarningBanner />
        <header className="px-4 py-4 border-b border-white/10">
          <p className="text-lg font-bold tracking-tight">
            English League Predictor
          </p>
          <p className="text-xs text-elp-muted">
            Sandsynligheder, programstyrke og sæsonscenarier
          </p>
        </header>
        <LeagueDataProvider>
          <main id="main-content" className="pb-24 sm:pb-10">
            {children}
          </main>
        </LeagueDataProvider>
        <FooterLegal />
        <BottomNav />
      </body>
    </html>
  );
}
