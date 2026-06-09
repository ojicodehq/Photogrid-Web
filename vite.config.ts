import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { serwist } from "@serwist/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = dirname(fileURLToPath(import.meta.url));

// Version embarquée dans le build (= package.json au moment du build). Sert
// de repli quand aucun bundle OTA n'est actif, et de référence d'affichage.
const buildVersion: string = JSON.parse(
  readFileSync(resolve(rootDir, "package.json"), "utf8"),
).version;

// `base: "./"` : chemins relatifs, indispensable pour le packaging
// Capacitor (WebView servie hors racine) et sans effet sur le déploiement
// web. Le routing est en HashRouter, donc aucune dépendance à un fallback
// SPA côté serveur.
export default defineConfig({
  base: "./",
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion),
  },
  resolve: {
    alias: {
      "@": resolve(rootDir, "src"),
    },
  },
  plugins: [
    react(),
    serwist({
      swSrc: "src/sw.ts",
      swDest: "sw.js",
      globDirectory: "dist",
      injectionPoint: "self.__SW_MANIFEST",
      rollupFormat: "iife",
    }),
  ],
});
