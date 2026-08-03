/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ingen API-nøgler eller hemmeligheder eksponeres til klienten.
  // Kun variabler med NEXT_PUBLIC_-præfiks sendes til browseren, og
  // API_FOOTBALL_KEY bruges udelukkende server-side (route handlers).
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
