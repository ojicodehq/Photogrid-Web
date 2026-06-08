import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/dm-sans";
import "@fontsource-variable/outfit";
import "@/styles/globals.css";

import { AppRouter } from "@/AppRouter";
import { registerServiceWorker } from "@/lib/registerSW";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Élément racine #root introuvable dans index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);

registerServiceWorker();
