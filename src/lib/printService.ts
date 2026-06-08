import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Printer } from "@capgo/capacitor-printer";

import { generatePdf } from "@/lib/pdf/generatePdf";
import type { LayoutConfig, PhotoType } from "@/types";

const PDF_FILENAME = "photogrid.pdf";

/**
 * Convertit un blob en base64 (sans le préfixe `data:`). Passe par
 * `FileReader` pour gérer les gros fichiers sans saturer la pile d'appels.
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Lecture du blob échouée"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Génère le PDF d'impression et le présente à l'utilisateur.
 *
 * - **Natif (APK Android)** : le PDF est écrit dans le cache puis envoyé
 *   au PrintManager via `printFile` : et non `printBase64`, qui crasherait
 *   au-delà de ~5 Mo (un lot de photos HD les dépasse largement).
 * - **Web** : le PDF s'ouvre dans un nouvel onglet ; l'utilisateur
 *   l'imprime ou l'enregistre depuis le lecteur PDF du navigateur.
 *
 * Le PDF lui-même est identique sur les deux plateformes (cf.
 * `generatePdf`) : qualité déterministe, octets sources préservés.
 */
export async function printDocument(
  photos: PhotoType[],
  layout: LayoutConfig,
): Promise<void> {
  const pdfBytes = await generatePdf(photos, layout);
  // Re-wrap dans un Uint8Array adossé à un ArrayBuffer concret : `pdf.save()`
  // type son retour avec `ArrayBufferLike`, non assignable tel quel à BlobPart.
  const blob = new Blob([new Uint8Array(pdfBytes)], {
    type: "application/pdf",
  });

  if (Capacitor.isNativePlatform()) {
    const data = await blobToBase64(blob);
    const { uri } = await Filesystem.writeFile({
      path: PDF_FILENAME,
      data,
      directory: Directory.Cache,
    });
    await Printer.printFile({
      name: "PhotoGrid",
      path: uri,
      mimeType: "application/pdf",
    });
    return;
  }

  // Web : ouverture dans un nouvel onglet (lecteur PDF du navigateur).
  // `generatePdf` a pu durer plusieurs secondes : l'appel est détaché du
  // clic et la pop-up peut être bloquée : on retombe alors sur un
  // téléchargement, qui ne dépend pas du geste utilisateur.
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank", "noopener");
  if (!opened) {
    const link = document.createElement("a");
    link.href = url;
    link.download = "photogrid.pdf";
    link.click();
  }
  // Révocation différée : laisser le temps à l'onglet/téléchargement d'aboutir.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
