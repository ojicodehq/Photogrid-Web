import { cn } from "@/lib/utils";

/**
 * Photos de démonstration du hero (décoratives, donc `aria-hidden` côté parent).
 * Stockées dans `public/hero/` — locales, conformes au CSP `img-src 'self'`.
 */
const PHOTOS = Array.from({ length: 9 }, (_, i) => `/hero/photo-${i + 1}.webp`);

/**
 * Une case de la grille :
 * - `photo` : vignette remplie
 * - `slot`  : emplacement vide discret (filet fin) → « grille en cours »
 * - `next`  : emplacement « à composer » (liseré terracotta qui respire)
 * - `gap`   : trou transparent (réserve la place sans rien dessiner)
 */
export type HeroCell = "photo" | "slot" | "next" | "gap";

type HeroGridProps = {
  cells: HeroCell[];
  columns: number;
  size?: "sm" | "lg";
  className?: string;
};

/**
 * Grille de photos « en composition » du hero. Les vignettes apparaissent en
 * cascade au chargement (cf. `.hero-cell` dans globals.css), l'emplacement
 * `next` pulse doucement. Entièrement theme-aware (tokens `foreground`/`primary`).
 */
export function HeroGrid({ cells, columns, size = "sm", className }: HeroGridProps) {
  const rounded = size === "lg" ? "rounded-xl" : "rounded-md";
  const gap = size === "lg" ? "gap-2.5" : "gap-1.5";

  let photoIndex = 0;
  let revealIndex = 0;

  return (
    <div
      aria-hidden="true"
      className={cn("grid", gap, className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {cells.map((cell, i) => {
        if (cell === "photo") {
          const src = PHOTOS[photoIndex % PHOTOS.length];
          const delay = revealIndex * 70;
          photoIndex += 1;
          revealIndex += 1;
          return (
            <div
              key={i}
              className={cn(
                "hero-cell aspect-square bg-cover bg-center ring-1 ring-black/5 shadow-sm",
                rounded,
              )}
              style={{
                backgroundImage: `url(${src})`,
                animationDelay: `${delay}ms`,
              }}
            />
          );
        }
        if (cell === "slot") {
          return (
            <div
              key={i}
              className={cn(
                "bg-foreground/[0.035] ring-foreground/10 aspect-square ring-1 ring-inset",
                rounded,
              )}
            />
          );
        }
        if (cell === "next") {
          return (
            <div
              key={i}
              className={cn("hero-next bg-primary/5 aspect-square", rounded)}
            />
          );
        }
        return <div key={i} className="aspect-square" />;
      })}
    </div>
  );
}

/** Motif mobile : bande de photos en haut, titre dégagé, accent en bas à droite. */
export const HERO_CELLS_MOBILE: HeroCell[] = [
  "photo", "photo", "photo", "photo",
  "gap",   "photo", "photo", "photo",
  "gap",   "gap",   "gap",   "next",
  "gap",   "gap",   "gap",   "photo",
  "gap",   "gap",   "gap",   "gap",
];

/** Motif desktop : grille plus pleine, lecture « voilà le résultat ». */
export const HERO_CELLS_DESKTOP: HeroCell[] = [
  "photo", "photo", "photo", "photo",
  "photo", "photo", "photo", "slot",
  "slot",  "photo", "photo", "photo",
  "photo", "photo", "next",  "photo",
];
