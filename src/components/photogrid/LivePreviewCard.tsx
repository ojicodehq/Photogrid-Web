import { ChevronLeft, ChevronRight } from "lucide-react";

import { getPaperDimensionsMm } from "@/lib/paperSizes";
import { usePhotoGridStore } from "@/lib/store";
import { usePagination } from "@/lib/usePagination";
import { cn } from "@/lib/utils";

const MINI_WIDTH_PX = 100;

/**
 * Aperçu en direct de la page courante au sommet du LayoutConfigPanel.
 * Reflète instantanément les changements de grille / format / orientation /
 * marges / espacement pour éviter l'aller-retour vers /preview pendant la
 * configuration. Navigation pages intégrée quand totalPages > 1.
 */
export function LivePreviewCard() {
  const layout = usePhotoGridStore((s) => s.layout);
  const {
    currentPage,
    totalPages,
    photosPerPage,
    currentPagePhotos,
    canGoPrev,
    canGoNext,
    goToPrevPage,
    goToNextPage,
    goToPage,
  } = usePagination();

  const dims = getPaperDimensionsMm(layout.pageSize, layout.orientation);
  const aspect = dims.width / dims.height;
  const scale = MINI_WIDTH_PX / dims.width; // px per mm : uniform on both axes

  const cells = Array.from(
    { length: photosPerPage },
    (_, i) => currentPagePhotos[i] ?? null,
  );

  return (
    <div className="bg-card border-border flex items-center gap-4 rounded-2xl border p-4">
      <div
        className="bg-secondary border-border/60 shrink-0 overflow-hidden rounded-sm border shadow-sm"
        style={{
          width: MINI_WIDTH_PX,
          aspectRatio: aspect,
          padding:
            `${layout.margins.top * scale}px ` +
            `${layout.margins.right * scale}px ` +
            `${layout.margins.bottom * scale}px ` +
            `${layout.margins.left * scale}px`,
        }}
      >
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
            gap: `${Math.max(0.5, layout.spacing * scale)}px`,
          }}
        >
          {cells.map((photo, i) => (
            <div
              key={i}
              className={cn(
                "rounded-[1px]",
                photo ? "bg-cover bg-center" : "bg-muted/60",
              )}
              style={
                photo ? { backgroundImage: `url(${photo.uri})` } : undefined
              }
            />
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-primary font-display mb-1.5 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase">
          <span className="bg-primary inline-block size-1.5 animate-pulse rounded-full" />
          Aperçu live
        </div>
        <div className="font-display text-[16px] font-bold tracking-tight">
          Page {currentPage + 1} sur {totalPages}
        </div>
        <div className="text-muted-foreground mt-0.5 text-[12px]">
          {photosPerPage} {photosPerPage > 1 ? "emplacements" : "emplacement"} par page
        </div>

        {totalPages > 1 ? (
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={goToPrevPage}
              disabled={!canGoPrev}
              className="border-border hover:bg-secondary flex size-7 items-center justify-center rounded-lg border disabled:opacity-30"
              aria-label="Page précédente"
            >
              <ChevronLeft className="size-3" strokeWidth={2.5} />
            </button>
            <div className="flex flex-1 items-center justify-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => goToPage(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === currentPage ? "bg-primary w-3.5" : "bg-border w-1.5",
                  )}
                  aria-label={`Aller à la page ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={!canGoNext}
              className="border-border hover:bg-secondary flex size-7 items-center justify-center rounded-lg border disabled:opacity-30"
              aria-label="Page suivante"
            >
              <ChevronRight className="size-3" strokeWidth={2.5} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
