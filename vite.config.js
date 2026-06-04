import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon.svg", "icon-maskable.svg"],
      manifest: {
        name: "Flor de Lis · Gestión",
        short_name: "Flor de Lis",
        description: "Gestión de reservas del Complejo Flor de Lis",
        lang: "es",
        dir: "ltr",
        theme_color: "#385a45",
        background_color: "#f7f7f2",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
        // No cachear las llamadas a Supabase (siempre red).
        navigateFallbackDenylist: [/^\/auth/, /supabase/],
      },
    }),
  ],
  server: { port: 5173 },
  build: { outDir: "dist" },
});
