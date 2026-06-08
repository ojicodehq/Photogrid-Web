import exifr from "exifr";

import type { PhotoType } from "@/types";

/**
 * Limite douce sur le nombre de photos chargées simultanément.
 *
 * Chaque photo crée une blob URL qui maintient l'image en RAM côté
 * navigateur. Sur mobile, dépasser cette limite peut faire crasher
 * l'onglet (notamment iOS Safari, plus restrictif). Au-delà, on
 * affiche un toast d'avertissement et on refuse les nouveaux fichiers.
 */
export const MAX_PHOTOS = 80;

/**
 * Convertit un `File` en `PhotoType` :
 * - crée une blob URL utilisable comme `<img src>`
 * - lit l'EXIF pour récupérer l'orientation source
 * - décode l'image pour obtenir les dimensions naturelles
 *
 * En cas d'échec de décodage (format non supporté), retourne `null` :
 * le caller affiche un toast d'erreur et ignore le fichier.
 */
export async function fileToPhoto(file: File): Promise<PhotoType | null> {
  const uri = URL.createObjectURL(file);

  try {
    // EXIF : on n'a besoin que de Orientation. exifr accepte un File.
    const exif = await exifr.parse(file, ["Orientation"]).catch(() => null);
    const orientation = (exif?.Orientation as number | undefined) ?? 1;

    const { width, height } = await readImageDimensions(uri, orientation);

    return {
      uri,
      width,
      height,
      name: file.name,
      type: file.type,
      size: file.size,
      exifOrientation: orientation,
    };
  } catch {
    URL.revokeObjectURL(uri);
    return null;
  }
}

/**
 * Lit les dimensions naturelles d'une image en respectant l'orientation EXIF.
 * Pour les orientations 5/6/7/8 (rotations 90°), on inverse width/height
 * pour qu'elles correspondent au rendu visuel après application de
 * `image-orientation: from-image`.
 */
function readImageDimensions(
  uri: string,
  orientation: number,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const rotated = orientation >= 5 && orientation <= 8;
      resolve({
        width: rotated ? img.naturalHeight : img.naturalWidth,
        height: rotated ? img.naturalWidth : img.naturalHeight,
      });
    };
    img.onerror = () => reject(new Error("decode failed"));
    img.src = uri;
  });
}

/** Libère les blob URLs d'un set de photos (ex. au déchargement). */
export function revokePhotos(photos: PhotoType[]): void {
  for (const p of photos) {
    if (p.uri.startsWith("blob:")) {
      URL.revokeObjectURL(p.uri);
    }
  }
}
