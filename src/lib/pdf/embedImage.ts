import type { PDFDocument, PDFImage } from "pdf-lib";

import type { PhotoType } from "@/types";

/**
 * Embarquement d'une photo dans un document PDF.
 *
 * Principe directeur : **zéro recompression**. Les octets JPEG/PNG
 * sources (le fichier original tel qu'importé, accessible via la blob
 * URL) sont embarqués tels quels : la qualité du tirage papier est donc
 * exactement celle de la photo d'origine, sans rasterisation ni perte.
 *
 * Seul cas de recompression : un format non géré nativement par pdf-lib
 * (WebP, HEIC…) est transcodé via `<canvas>` en PNG : PNG étant un
 * format sans perte, la qualité reste préservée (au prix de la taille).
 */

export type EmbeddedPhoto = {
  image: PDFImage;
  /** Orientation EXIF (1–8) : à appliquer au dessin, pdf-lib ne le fait pas. */
  exifOrientation: number;
};

/** Récupère les octets bruts d'une photo depuis sa blob URL. */
async function fetchBytes(uri: string): Promise<Uint8Array> {
  const res = await fetch(uri);
  if (!res.ok) throw new Error(`Lecture image échouée : ${uri}`);
  return new Uint8Array(await res.arrayBuffer());
}

/** Détecte le format via les magic bytes (plus fiable que l'extension). */
function detectFormat(bytes: Uint8Array): "jpg" | "png" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }
  return null;
}

/**
 * Transcode une image vers PNG via `<canvas>` : utilisé en dernier
 * recours pour les formats que pdf-lib ne sait pas embarquer (WebP…).
 * PNG est sans perte : pas de dégradation, seulement un fichier plus lourd.
 */
async function transcodeToPng(uri: string): Promise<Uint8Array> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Décodage image échoué"));
    el.src = uri;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Contexte canvas 2D indisponible");
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  // Libère le bitmap : un canvas HD pèse plusieurs dizaines de Mo, à ne
  // pas laisser traîner jusqu'au GC sur mobile.
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) throw new Error("Transcodage PNG échoué");
  return new Uint8Array(await blob.arrayBuffer());
}

/**
 * Embarque une photo dans `pdf` et renvoie l'image PDF + son orientation
 * EXIF. Tente l'embarquement direct des octets sources ; bascule sur le
 * transcodage canvas uniquement si pdf-lib refuse le fichier.
 */
export async function embedPhoto(
  pdf: PDFDocument,
  photo: PhotoType,
): Promise<EmbeddedPhoto> {
  const bytes = await fetchBytes(photo.uri);
  const format = detectFormat(bytes);

  let image: PDFImage;
  try {
    if (format === "jpg") {
      image = await pdf.embedJpg(bytes);
    } else if (format === "png") {
      image = await pdf.embedPng(bytes);
    } else {
      image = await pdf.embedPng(await transcodeToPng(photo.uri));
    }
  } catch {
    // JPEG exotique (CMYK, etc.) refusé par pdf-lib → transcodage PNG.
    image = await pdf.embedPng(await transcodeToPng(photo.uri));
  }

  return { image, exifOrientation: photo.exifOrientation ?? 1 };
}
