import { Capacitor } from "@capacitor/core";
import { Serwist } from "@serwist/window";

/**
 * Enregistre le service worker PWA (`/sw.js`, généré au build par
 * `@serwist/vite`).
 *
 * - Jamais en contexte natif Capacitor : l'APK embarque déjà tous les
 *   assets, un SW y serait inutile et pourrait interférer avec le
 *   scheme local de la WebView.
 * - Uniquement en production : en dev, le SW masquerait le HMR de Vite.
 * - `skipWaiting: false` côté worker → un nouveau SW s'installe puis
 *   attend le prochain chargement naturel pour s'activer.
 */
export function registerServiceWorker(): void {
  if (Capacitor.isNativePlatform()) return;
  if (!import.meta.env.PROD) return;
  if (!("serviceWorker" in navigator)) return;

  const serwist = new Serwist("/sw.js", { scope: "/", type: "classic" });
  void serwist.register();
}
