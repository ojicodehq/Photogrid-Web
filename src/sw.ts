import { defaultCache } from "@serwist/vite/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

/**
 * Service worker : généré par serwist au build (`@serwist/vite`).
 *
 * On précache les assets statiques injectés au build (`__SW_MANIFEST`)
 * et on délègue les autres requêtes à `defaultCache` (stratégies par
 * défaut de serwist : NetworkFirst pour HTML, StaleWhileRevalidate
 * pour CSS/JS, CacheFirst pour les images statiques de l'app).
 *
 * Les blob:URLs des photos utilisateur sont par construction
 * inaccessibles au SW (origine différente, pas de fetch event) : pas
 * besoin de les exclure explicitement.
 */
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false, // attente d'un reload utilisateur pour activer
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
