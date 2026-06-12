import { cn } from "@/lib/utils";

/**
 * Tuiles de démonstration du hero : dégradés maison dans la charte Ojicode
 * (terracotta, ambre, sage, bleu poussiéreux + quelques « horizons »). 100 %
 * CSS, aucun fichier image ni licence tierce, aucun visage. Une fine lueur
 * radiale en surcouche donne du relief (moins plat qu'un dégradé simple).
 */
const SHEEN = "radial-gradient(circle at 30% 24%, rgba(255,255,255,0.16), transparent 56%)";
const TILES = [
  `${SHEEN}, linear-gradient(150deg, #c4693d, #e0a06a)`,
  `${SHEEN}, linear-gradient(165deg, #f1e0cd 8%, #e2ad7e)`,
  `${SHEEN}, linear-gradient(150deg, #3f6b7a, #8fb3c0)`,
  `${SHEEN}, linear-gradient(150deg, #a4502b, #c97d5a)`,
  `${SHEEN}, linear-gradient(150deg, #5b8c5a, #a9c6a0)`,
  `${SHEEN}, linear-gradient(165deg, #f3d9b8 10%, #d98e54)`,
  `${SHEEN}, linear-gradient(150deg, #8c7a6b, #c9b7a4)`,
  `${SHEEN}, linear-gradient(150deg, #3f6b52, #7fa98a)`,
  `${SHEEN}, linear-gradient(150deg, #c97d5a, #e8b6a0)`,
];

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
          const tile = TILES[photoIndex % TILES.length];
          const delay = revealIndex * 70;
          photoIndex += 1;
          revealIndex += 1;
          return (
            <div
              key={i}
              className={cn(
                // ring + ombre theme-aware : la tuile se détache du fond
                "hero-cell ring-foreground/15 aspect-square shadow-md shadow-black/20 ring-1",
                rounded,
              )}
              style={{
                backgroundImage: tile,
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
                "bg-foreground/[0.05] ring-foreground/15 aspect-square ring-1 ring-inset",
                rounded,
              )}
            />
          );
        }
        if (cell === "next") {
          return (
            <div
              key={i}
              className={cn("hero-next bg-primary/10 aspect-square", rounded)}
            />
          );
        }
        return <div key={i} className="aspect-square" />;
      })}
    </div>
  );
}

/**
 * Motif mobile : cluster de photos en haut à droite, plus dense (peu de vides
 * qui « clignotent » en light), une seule case « next » comme accent. La
 * colonne gauche reste libre pour le titre.
 */
export const HERO_CELLS_MOBILE: HeroCell[] = [
  "photo", "photo", "photo", "photo",
  "gap",   "photo", "photo", "photo",
  "gap",   "gap",   "photo", "photo",
  "gap",   "gap",   "next",  "photo",
  "gap",   "gap",   "gap",   "photo",
];

/** Motif desktop : grille plus pleine, lecture « voilà le résultat ». */
export const HERO_CELLS_DESKTOP: HeroCell[] = [
  "photo", "photo", "photo", "photo",
  "photo", "photo", "photo", "slot",
  "slot",  "photo", "photo", "photo",
  "photo", "photo", "next",  "photo",
];
