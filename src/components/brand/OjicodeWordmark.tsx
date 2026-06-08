import { cn } from "@/lib/utils";

type Props = {
  /** Hauteur du wordmark en px. Largeur = height × 3.5 (ratio source 700×200). */
  height?: number;
  className?: string;
};

/**
 * Wordmark "ojicode". Swap automatique selon le thème :
 * - `ojicode-light-*.png` pour le light mode (oji terracotta + code warm dark)
 * - `ojicode-dark-*.png`  pour le dark mode  (oji terracotta + code cream)
 */
export function OjicodeWordmark({ height = 24, className }: Props) {
  const width = Math.round(height * 3.5);
  return (
    <>
      <img
        src="/ojicode/ojicode-light.png"
        alt="Ojicode"
        width={width}
        height={height}
        className={cn("dark:hidden", className)}
        style={{ width, height }}
      />
      <img
        src="/ojicode/ojicode-dark.png"
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        className={cn("hidden dark:block", className)}
        style={{ width, height }}
      />
    </>
  );
}
