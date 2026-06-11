import type { PdfWorkerResponse } from "@/lib/pdf/pdfWorker";
import type { LayoutConfig, PhotoType } from "@/types";

/** Lance la génération PDF dans un Worker dédié (un par impression). */
function generatePdfViaWorker(
  photos: PhotoType[],
  layout: LayoutConfig,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("./pdfWorker.ts", import.meta.url), {
        type: "module",
      });
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
      return;
    }
    worker.onmessage = (e: MessageEvent<PdfWorkerResponse>) => {
      worker.terminate();
      if (e.data.ok) resolve(e.data.bytes);
      else reject(new Error(e.data.error));
    };
    worker.onerror = (e) => {
      worker.terminate();
      reject(new Error(e.message || "Chargement du worker PDF échoué"));
    };
    worker.postMessage({ photos, layout });
  });
}

/**
 * Génère le PDF dans un Worker, avec repli main-thread si le Worker
 * échoue à se charger.
 *
 * Le repli compte pour les mises à jour OTA : un bundle live-update dont
 * le chunk worker manquerait (déploiement partiel, précache incomplet)
 * doit rester imprimable — `notifyAppReady` étant déjà passé, le rollback
 * Capgo ne couvrirait pas une impression cassée silencieusement.
 */
export async function generatePdfResilient(
  photos: PhotoType[],
  layout: LayoutConfig,
): Promise<Uint8Array> {
  try {
    return await generatePdfViaWorker(photos, layout);
  } catch (err) {
    console.warn("Worker PDF indisponible, repli sur le main thread", err);
    const { generatePdf } = await import("@/lib/pdf/generatePdf");
    return generatePdf(photos, layout);
  }
}
