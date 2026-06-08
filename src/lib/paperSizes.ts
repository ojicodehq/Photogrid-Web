import type {
  PageOrientation,
  PageSize,
  PaperDimensions,
} from "@/types";

/**
 * Dimensions standard en millimètres.
 * Source de vérité unique pour le rendu écran (preview) et l'impression.
 * On n'expose PAS de conversion vers des pixels : le navigateur convertit
 * `mm` en physique directement à l'impression, ce qui garantit un rendu
 * papier exact.
 */
export const PAPER_SIZES: Record<Exclude<PageSize, "Custom">, PaperDimensions> = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
};

export function getPaperDimensionsMm(
  pageSize: PageSize,
  orientation: PageOrientation,
  custom?: { width?: number; height?: number },
): PaperDimensions {
  const base =
    pageSize === "Custom"
      ? { width: custom?.width ?? 200, height: custom?.height ?? 200 }
      : PAPER_SIZES[pageSize];

  return orientation === "portrait"
    ? base
    : { width: base.height, height: base.width };
}
