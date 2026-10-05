import { X, LifeBuoy } from "lucide-react";

/**
 * Floating cue card for the "I'm Stuck" button: a ready-to-speak line plus
 * the slide's remaining points, built entirely from the slide's own text
 * (see slideText.js) so it appears instantly with no network dependency.
 */
export default function RescuePanel({ cue, onClose }) {
  if (!cue) return null;

  return (
    <div className="absolute bottom-4 left-4 z-30 max-w-sm rounded-2xl border border-white/10 bg-navy-950/95 p-4 shadow-2xl backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
          <LifeBuoy size={14} />
          Quick cue
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close rescue cue"
          className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/40">Say this</p>
      <p className="mb-3 text-sm leading-relaxed text-white">{cue.suggestion}</p>

      {cue.points.length > 0 && (
        <>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/40">
            Also on this slide
          </p>
          <ul className="space-y-1">
            {cue.points.map((point, i) => (
              <li key={i} className="text-xs leading-relaxed text-white/70">
                • {point}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
