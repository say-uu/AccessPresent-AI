import { useEffect, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import { renderPageToCanvas } from "../../utils/pdfLoader";

function Thumbnail({ pdfDoc, pageNumber, isActive, snippet, onClick }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    renderPageToCanvas(pdfDoc, pageNumber, canvasRef.current, 240)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNumber]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl overflow-hidden border-2 bg-mist-50 transition-colors ${
        isActive ? "border-accent-indigo" : "border-transparent hover:border-white/30"
      }`}
    >
      <div className="relative aspect-video bg-white">
        <canvas ref={canvasRef} className={`h-full w-full object-contain ${ready ? "block" : "invisible"}`} />
        {!ready && <div className="absolute inset-0 animate-pulse bg-mist-100" />}
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {pageNumber}
        </span>
      </div>
      {snippet && <p className="line-clamp-1 px-2 py-1.5 text-[11px] text-navy-500">{snippet}</p>}
    </button>
  );
}

/**
 * Full-screen slide browser: a thumbnail grid of every page, filterable by
 * a text search against each slide's own content. `results` is null when
 * there's no query (show every page) or an array of {page, snippet}
 * matches built by the caller from its text cache (see slideText.js).
 */
export default function SlideNavigator({
  open,
  onClose,
  pdfDoc,
  numPages,
  currentPage,
  query,
  onQueryChange,
  indexing,
  results,
  onJump,
}) {
  if (!open) return null;

  const pages =
    results === null
      ? Array.from({ length: numPages }, (_, i) => ({ page: i + 1, snippet: null }))
      : results;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-navy-950/95 backdrop-blur-sm">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <Search size={16} className="text-white/50" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search this deck, or browse below…"
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
        />
        {indexing && <span className="text-xs text-white/40">Indexing…</span>}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close slide browser"
          className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {pages.length === 0 ? (
          <p className="mt-10 text-center text-sm text-white/40">No slides match “{query}”.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {pages.map(({ page, snippet }) => (
              <Thumbnail
                key={page}
                pdfDoc={pdfDoc}
                pageNumber={page}
                isActive={page === currentPage}
                snippet={snippet}
                onClick={() => onJump(page)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
