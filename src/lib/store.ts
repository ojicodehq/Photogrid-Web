import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  LayoutConfig,
  PhotoType,
  ThemePreference,
} from "@/types";

const DEFAULT_LAYOUT: LayoutConfig = {
  columns: 4,
  rows: 5,
  spacing: 5, // mm (vrais millimètres maintenant : slider 0-40 mm)
  pageSize: "A4",
  orientation: "portrait",
  fitMode: "contain",
  margins: { top: 10, right: 10, bottom: 10, left: 10 },
  quality: "standard",
  totalPhotos: 0,
};

type PhotoGridState = {
  /** Persisté */
  layout: LayoutConfig;
  theme: ThemePreference;
  /** Session-only : non persisté */
  photos: PhotoType[];
  currentPage: number;

  // Actions photos
  addPhotos: (photos: PhotoType[]) => void;
  removePhoto: (index: number) => void;
  clearPhotos: () => void;

  // Actions layout
  updateLayout: (patch: Partial<LayoutConfig>) => void;
  resetLayout: () => void;

  // Actions theme
  setTheme: (t: ThemePreference) => void;

  // Actions pagination
  setCurrentPage: (page: number) => boolean;
};

/**
 * Store global Zustand.
 *
 * `persist` ne sérialise QUE `layout` et `theme` (cf. `partialize`).
 * Les `photos` sont des blob URLs créées par `URL.createObjectURL` :
 * elles n'ont aucune valeur après un reload (URL invalidée), donc on ne
 * les persiste pas.
 *
 * L'hydratation depuis `localStorage` est synchrone au premier render
 * (app 100 % client).
 */
export const usePhotoGridStore = create<PhotoGridState>()(
  persist(
    (set, get) => ({
      layout: DEFAULT_LAYOUT,
      theme: "system",
      photos: [],
      currentPage: 0,

      addPhotos: (newPhotos) =>
        set((state) => {
          const photos = [...state.photos, ...newPhotos];
          return {
            photos,
            layout: { ...state.layout, totalPhotos: photos.length },
          };
        }),

      removePhoto: (index) =>
        set((state) => {
          const removed = state.photos[index];
          if (removed?.uri.startsWith("blob:")) {
            URL.revokeObjectURL(removed.uri);
          }
          const photos = state.photos.filter((_, i) => i !== index);
          return {
            photos,
            layout: { ...state.layout, totalPhotos: photos.length },
            currentPage: 0,
          };
        }),

      clearPhotos: () =>
        set((state) => {
          state.photos.forEach((p) => {
            if (p.uri.startsWith("blob:")) URL.revokeObjectURL(p.uri);
          });
          return {
            photos: [],
            layout: { ...state.layout, totalPhotos: 0 },
            currentPage: 0,
          };
        }),

      updateLayout: (patch) =>
        set((state) => ({ layout: { ...state.layout, ...patch } })),

      resetLayout: () =>
        set((state) => ({
          layout: { ...DEFAULT_LAYOUT, totalPhotos: state.photos.length },
        })),

      setTheme: (t) => set({ theme: t }),

      setCurrentPage: (page) => {
        const { photos, layout } = get();
        const photosPerPage = layout.rows * layout.columns;
        const totalPages = Math.max(1, Math.ceil(photos.length / photosPerPage));
        if (page < 0 || page >= totalPages) return false;
        set({ currentPage: page });
        return true;
      },
    }),
    {
      name: "photogrid-storage",
      storage: createJSONStorage(() => localStorage),
      // `totalPhotos` est dérivé de `photos.length` (session-only), donc
      // omis du persist pour éviter qu'une valeur stale traîne en
      // localStorage après reload. Le merge zustand réinjecte 0 depuis
      // DEFAULT_LAYOUT.
      partialize: (state) => ({
        layout: (() => {
          const { totalPhotos: _omit, ...rest } = state.layout;
          return rest as Omit<LayoutConfig, "totalPhotos">;
        })(),
        theme: state.theme,
      }),
    },
  ),
);
