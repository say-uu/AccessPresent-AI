import { Clock } from "lucide-react";

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const TONE_CLASSES = {
  ok: "bg-navy-950/80 text-white/90",
  warn: "bg-amber-500/90 text-white",
  over: "bg-red-500/90 text-white",
};

/**
 * Small floating readout of total elapsed time and time on the current
 * slide. `status` ("ok" | "warn" | "over") reflects whether the current
 * slide is within its share of an optional target length — see
 * Presentation.jsx for the budget math; with no target set it's always "ok".
 */
export default function PaceTracker({ totalElapsedSec, slideElapsedSec, status }) {
  return (
    <div
      className={`absolute top-4 left-4 z-40 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-sm transition-colors ${TONE_CLASSES[status]}`}
    >
      <Clock size={13} />
      <span className="tabular-nums">{formatTime(totalElapsedSec)}</span>
      <span className="opacity-50">·</span>
      <span className="tabular-nums">this slide {formatTime(slideElapsedSec)}</span>
    </div>
  );
}
