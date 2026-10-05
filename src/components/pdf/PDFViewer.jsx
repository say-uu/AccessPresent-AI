import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { renderPageToCanvas, RenderCancelledError } from "../../utils/pdfLoader";
import LoadingState from "../common/LoadingState.jsx";
import ErrorMessage from "../common/ErrorMessage.jsx";

/**
 * Renders a single page of a pdf.js document onto a canvas, sized to fill
 * its container while preserving the page's own aspect ratio.
 */
export default function PDFViewer({ pdfDoc, pageNumber, className = "" }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [renderState, setRenderState] = useState("loading"); // loading | ready | error

  useEffect(() => {
    if (!pdfDoc || !containerRef.current || !canvasRef.current) return undefined;

    let cancelled = false;
    setRenderState("loading");

    const render = async () => {
      try {
        const containerWidth = containerRef.current.clientWidth;
        if (!containerWidth) return;
        await renderPageToCanvas(pdfDoc, pageNumber, canvasRef.current, containerWidth);
        if (!cancelled) setRenderState("ready");
      } catch (err) {
        if (err instanceof RenderCancelledError) return; // a newer render already queued behind this one
        if (!cancelled) setRenderState("error");
      }
    };

    render();

    const observer = new ResizeObserver(() => render());
    observer.observe(containerRef.current);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [pdfDoc, pageNumber]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center w-full ${className}`}
    >
      {renderState === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <LoadingState label="Rendering slide…" />
        </div>
      )}
      {renderState === "error" && (
        <div className="p-6">
          <ErrorMessage
            icon={RefreshCw}
            title="This slide couldn't be rendered"
            description="There was a problem rendering this page of your PDF. Try reloading the presentation."
          />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`rounded-lg shadow-sm ${renderState === "ready" ? "block" : "invisible"}`}
        aria-label={`Slide ${pageNumber}`}
      />
    </div>
  );
}
