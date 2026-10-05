// Central pdf.js setup. Configuring the worker here (once) keeps every
// caller free of Vite-specific import quirks.
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export class PdfValidationError extends Error {}

/** Reads a File into an ArrayBuffer while reporting byte-level progress. */
function readFileWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/** Validates file type/size, then parses it into a pdf.js document proxy. */
export async function loadPdfFromFile(file, onProgress) {
  if (!file) {
    throw new PdfValidationError("No file was provided.");
  }
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    throw new PdfValidationError("Only PDF files are supported.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new PdfValidationError(
      `File is too large (${formatFileSize(file.size)}). Maximum size is ${formatFileSize(
        MAX_FILE_SIZE_BYTES
      )}.`
    );
  }

  const arrayBuffer = await readFileWithProgress(file, onProgress);
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    if (pdfDoc.numPages < 1) {
      throw new PdfValidationError("This PDF has no pages to present.");
    }
    return pdfDoc;
  } catch (err) {
    if (err instanceof PdfValidationError) throw err;
    throw new PdfValidationError(
      "This PDF could not be read. It may be corrupted or password-protected."
    );
  }
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// pdf.js refuses to start a new render() on a canvas that still has one in
// flight, and a ResizeObserver (or React StrictMode's double-mount) can
// request a render before the previous one has finished. Rather than race
// to cancel the in-flight task, every request for a given canvas is queued
// and run strictly one at a time; a generation counter lets any request
// that was superseded before its turn skip the work entirely.
const canvasQueues = new WeakMap(); // canvas -> { queue: Promise, generation: number }

export class RenderCancelledError extends Error {}

function renderPageNow(pdfDoc, pageNumber, canvas, targetWidth) {
  return pdfDoc.getPage(pageNumber).then((page) => {
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = targetWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = viewport.width * devicePixelRatio;
    canvas.height = viewport.height * devicePixelRatio;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    const context = canvas.getContext("2d");
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    return page.render({ canvasContext: context, viewport }).promise.then(() => ({
      width: viewport.width,
      height: viewport.height,
    }));
  });
}

/** Renders a single PDF page onto a canvas at the given CSS pixel width. */
export function renderPageToCanvas(pdfDoc, pageNumber, canvas, targetWidth) {
  const prevState = canvasQueues.get(canvas) ?? { queue: Promise.resolve(), generation: 0 };
  const myGeneration = prevState.generation + 1;

  const task = prevState.queue.then(() => {
    if (canvasQueues.get(canvas)?.generation !== myGeneration) {
      throw new RenderCancelledError("Render was superseded before its turn.");
    }
    return renderPageNow(pdfDoc, pageNumber, canvas, targetWidth);
  });

  // Swallow rejections in the chain itself so one failed/cancelled render
  // doesn't block the next queued request; callers still see their own
  // rejection via the returned `task` promise.
  canvasQueues.set(canvas, { queue: task.catch(() => {}), generation: myGeneration });

  return task;
}
