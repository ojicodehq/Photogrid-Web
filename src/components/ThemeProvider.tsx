import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ComponentProps } from "react";

/**
 * Wrapper next-themes adapté à notre store Zustand.
 *
 * Le store contient la préférence persistée (`'light' | 'dark' | 'system'`).
 * `next-themes` applique la classe `.dark` sur `<html>` selon cette préf
 * et reflète le mode système quand `'system'`.
 *
 * On utilise `attribute="class"` pour rester compatible avec les variables
 * CSS définies dans `globals.css` (`:root` et `.dark`).
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
