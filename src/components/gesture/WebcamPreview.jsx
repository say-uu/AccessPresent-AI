import { Camera, Minus, Maximize2, VideoOff, AlertCircle, Loader2 } from "lucide-react";
import HandLandmarkOverlay from "./HandLandmarkOverlay.jsx";
import GestureStatusBadge from "./GestureStatusBadge.jsx";
import { GESTURES } from "../../utils/gestureConstants";

const GESTURE_LABELS = {
  [GESTURES.NONE]: "—",
  [GESTURES.POINTER]: "Pointer",
  [GESTURES.FIST]: "Closed Fist",
  [GESTURES.OPEN_PALM]: "Open Palm",
  [GESTURES.THUMBS_UP]: "Thumbs Up",
  [GESTURES.THUMBS_DOWN]: "Thumbs Down",
};

function deriveStatus({ cameraState, handInFrame, isPaused, modelStatus }) {
  if (cameraState !== "on") return "camera_off";
  if (modelStatus === "loading") return "loading";
  if (isPaused) return "paused";
  if (!handInFrame) return "no_hand";
  return "active";
}

export default function WebcamPreview({
  videoRef,
  cameraState,
  modelStatus,
  landmarks,
  gesture,
  confidence,
  handInFrame,
  isPaused,
  showLandmarks,
  mirrorCamera,
  onEnableCamera,
  isMinimized,
  onToggleMinimize,
  size = "sm",
}) {
  const status = deriveStatus({ cameraState, handInFrame, isPaused, modelStatus });
  const dimensions = "aspect-video w-full";

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={onToggleMinimize}
        aria-label="Expand camera preview"
        className="fixed bottom-24 right-3 sm:bottom-5 sm:right-5 z-40 flex items-center gap-2 rounded-full bg-navy-900 text-white pl-3 pr-4 py-2.5 shadow-lg hover:bg-navy-800"
      >
        <Camera size={16} />
        <span className="text-xs font-medium">Camera minimized</span>
        <Maximize2 size={14} />
      </button>
    );
  }

  return (
    <div
      className={`${size === "lg" ? "" : "fixed bottom-24 right-3 w-44 sm:bottom-5 sm:right-5 sm:w-64 z-40"} rounded-2xl border border-navy-900/10 bg-navy-950 shadow-xl overflow-hidden`}
    >
      <div className={`relative ${dimensions} bg-navy-900`}>
        <video
          ref={videoRef}
          playsInline
          muted
          className={`h-full w-full object-cover ${mirrorCamera ? "-scale-x-100" : ""}`}
        />

        {showLandmarks && cameraState === "on" && (
          <HandLandmarkOverlay landmarks={landmarks} />
        )}

        {cameraState === "off" && (
          <StateOverlay
            icon={Camera}
            message="Camera is off"
            actionLabel="Enable Camera"
            onAction={onEnableCamera}
          />
        )}
        {cameraState === "loading" && (
          <StateOverlay icon={Loader2} spin message="Requesting camera access…" />
        )}
        {cameraState === "denied" && (
          <StateOverlay
            icon={VideoOff}
            message="Camera permission denied"
            hint="Allow camera access in your browser's address bar, then try again."
            actionLabel="Try Again"
            onAction={onEnableCamera}
          />
        )}
        {cameraState === "not_found" && (
          <StateOverlay icon={VideoOff} message="No webcam found" hint="Connect a camera to use gesture control." />
        )}
        {cameraState === "error" && (
          <StateOverlay
            icon={AlertCircle}
            message="Couldn't start the camera"
            actionLabel="Try Again"
            onAction={onEnableCamera}
          />
        )}
        {cameraState === "on" && modelStatus === "loading" && (
          <StateOverlay icon={Loader2} spin message="Loading gesture model…" />
        )}
        {cameraState === "on" && modelStatus === "error" && (
          <StateOverlay icon={AlertCircle} message="Gesture recognition unavailable" hint="Hand tracking failed to load. Slide buttons still work." />
        )}

        {cameraState === "on" && (
          <span className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 text-[10px] font-medium text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        )}

        <button
          type="button"
          onClick={onToggleMinimize}
          aria-label="Minimize camera preview"
          className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
        >
          <Minus size={14} />
        </button>
      </div>

      <div className="px-3 py-2.5 flex items-center justify-between gap-2 bg-navy-950">
        <GestureStatusBadge status={status} />
        <div className="text-right">
          <p className="text-xs font-medium text-white/90">{GESTURE_LABELS[gesture] ?? "—"}</p>
          {handInFrame && (
            <p className="text-[10px] text-white/50">{Math.round(confidence * 100)}% confidence</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StateOverlay({ icon: Icon, message, hint, actionLabel, onAction, spin = false }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy-900/95 px-4 text-center">
      <Icon size={24} className={`text-white/70 ${spin ? "animate-spin" : ""}`} aria-hidden="true" />
      <p className="text-xs font-medium text-white">{message}</p>
      {hint && <p className="text-[10px] text-white/50 max-w-[15rem]">{hint}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 rounded-lg bg-accent-indigo px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-500"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
