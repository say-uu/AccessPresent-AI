import { ArrowLeft, ArrowRight, PauseCircle, PlayCircle, Target } from "lucide-react";

const NOTIFICATION_CONFIG = {
  next: { label: "Next slide", icon: ArrowRight },
  previous: { label: "Previous slide", icon: ArrowLeft },
  pointer_on: { label: "Pointer activated", icon: Target },
  paused: { label: "Gesture controls paused", icon: PauseCircle },
  resumed: { label: "Gesture controls resumed", icon: PlayCircle },
};

/**
 * Transient toast shown after a completed gesture action. `notification` is
 * `{ id, type }` — the id (unique per occurrence) is used as a React key so
 * repeated identical gestures replay the fade-in animation.
 */
export default function GestureNotification({ notification }) {
  if (!notification) return null;
  const config = NOTIFICATION_CONFIG[notification.type];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <div
      key={notification.id}
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed top-24 left-1/2 z-50 -translate-x-1/2 animate-slide-up"
    >
      <div className="flex items-center gap-2.5 rounded-full bg-navy-900/90 backdrop-blur-sm px-5 py-3 text-white shadow-xl">
        <Icon size={18} className="text-accent-blue" />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    </div>
  );
}
