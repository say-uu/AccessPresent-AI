import { Hand, Loader2, PauseCircle, ScanEye, VideoOff } from "lucide-react";

const CONFIG = {
  camera_off: { label: "Camera Off", icon: VideoOff, classes: "bg-navy-900/5 text-navy-500" },
  loading: { label: "Loading Model…", icon: Loader2, classes: "bg-navy-900/5 text-navy-500", spin: true },
  no_hand: { label: "No Hand Detected", icon: ScanEye, classes: "bg-amber-50 text-amber-600" },
  paused: { label: "Gestures Paused", icon: PauseCircle, classes: "bg-orange-50 text-orange-600" },
  active: { label: "Gestures Active", icon: Hand, classes: "bg-emerald-50 text-emerald-600" },
};

export default function GestureStatusBadge({ status, className = "" }) {
  const { label, icon: Icon, classes, spin } = CONFIG[status] ?? CONFIG.camera_off;

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${classes} ${className}`}
    >
      <Icon size={14} aria-hidden="true" className={spin ? "animate-spin" : ""} />
      {label}
    </span>
  );
}
