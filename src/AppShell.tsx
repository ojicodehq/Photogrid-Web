import { Outlet } from "react-router-dom";

import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

/**
 * Coquille applicative de l'app.
 *
 * `ThemeProvider` (next-themes) enveloppe toutes les routes pour
 * partager la préférence de thème. `Toaster` est monté une seule fois
 * ici. L'`Outlet` rend la route active.
 */
export function AppShell() {
  return (
    <ThemeProvider>
      <Outlet />
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
