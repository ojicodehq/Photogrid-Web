import { useCallback, useMemo } from "react";

import { usePhotoGridStore } from "@/lib/store";

/**
 * Hook de pagination.
 * Encapsule la logique de navigation inter-pages pour la grille.
 */
export function usePagination() {
  const photos = usePhotoGridStore((s) => s.photos);
  const layout = usePhotoGridStore((s) => s.layout);
  const currentPage = usePhotoGridStore((s) => s.currentPage);
  const setCurrentPage = usePhotoGridStore((s) => s.setCurrentPage);

  const photosPerPage = useMemo(
    () => Math.max(1, layout.rows * layout.columns),
    [layout.rows, layout.columns],
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(photos.length / photosPerPage)),
    [photos.length, photosPerPage],
  );

  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  const goToNextPage = useCallback(() => {
    if (canGoNext) setCurrentPage(currentPage + 1);
  }, [canGoNext, currentPage, setCurrentPage]);

  const goToPrevPage = useCallback(() => {
    if (canGoPrev) setCurrentPage(currentPage - 1);
  }, [canGoPrev, currentPage, setCurrentPage]);

  const goToPage = useCallback(
    (page: number) => setCurrentPage(page),
    [setCurrentPage],
  );

  const goToFirstPage = useCallback(
    () => setCurrentPage(0),
    [setCurrentPage],
  );

  const goToLastPage = useCallback(
    () => setCurrentPage(totalPages - 1),
    [totalPages, setCurrentPage],
  );

  const currentPagePhotos = useMemo(() => {
    const start = currentPage * photosPerPage;
    return photos.slice(start, start + photosPerPage);
  }, [currentPage, photosPerPage, photos]);

  const pageInfo = useMemo(
    () => ({
      current: currentPage + 1,
      total: totalPages,
      photosOnPage: currentPagePhotos.length,
      startIndex: currentPage * photosPerPage,
      endIndex: Math.min(
        (currentPage + 1) * photosPerPage,
        photos.length,
      ),
    }),
    [
      currentPage,
      totalPages,
      currentPagePhotos.length,
      photosPerPage,
      photos.length,
    ],
  );

  return {
    currentPage,
    totalPages,
    photosPerPage,
    currentPagePhotos,
    pageInfo,
    canGoPrev,
    canGoNext,
    goToNextPage,
    goToPrevPage,
    goToPage,
    goToFirstPage,
    goToLastPage,
  };
}
