// Tunable constants for the gesture-recognition safety pipeline.
// User-adjustable values (sensitivity, cooldown, pointer size) live in
// SettingsContext; everything here is a fixed implementation detail.

export const DEFAULT_SETTINGS = {
  sensitivity: 0.6, // 0-1 minimum confidence a pose/hand must reach to count
  cooldownMs: 1000, // lockout after a slide change
  pointerSize: 28, // px diameter of the virtual pointer dot
  showWebcam: true,
  showLandmarks: true,
  mirrorCamera: true,
  notificationsEnabled: true,
  captionsEnabled: false, // live speech-to-text captions (needs mic permission)
  paceTrackerEnabled: true, // on-screen elapsed-time / pace indicator
  presentationDurationMinutes: 0, // 0 = no target length set (plain clock, no pace warnings)
};

export const SETTINGS_STORAGE_KEY = "accesspresent_ai_settings";

// How long a static pose (fist / open palm / pointer / thumbs up / thumbs
// down) must be held, in ms, before it fires an action. Prevents accidental
// split-second flickers from pausing/resuming/advancing slides.
export const POSE_HOLD_MS = 350;

// Margin from the video edges; landmarks inside this margin are treated as
// "hand leaving the frame" and gestures are suspended.
export const FRAME_EDGE_MARGIN = 0.04;

// Smoothing factor for the virtual pointer (EMA). Higher = snappier.
export const POINTER_SMOOTHING = 0.35;

// Ignore pointer jitter smaller than this (normalized 0-1 units).
export const POINTER_DEAD_ZONE = 0.004;

// Maps the user-facing "sensitivity" slider (0 = strict, 1 = very sensitive)
// onto the minimum pose-confidence score required to accept a gesture.
export function sensitivityToConfidenceThreshold(sensitivity) {
  return 0.9 - sensitivity * 0.5; // sensitivity 0 -> 0.9, sensitivity 1 -> 0.4
}

export const GESTURES = {
  NONE: "none",
  POINTER: "pointer",
  FIST: "fist",
  OPEN_PALM: "open_palm",
  THUMBS_UP: "thumbs_up",
  THUMBS_DOWN: "thumbs_down",
};

export const STATUS = {
  CAMERA_OFF: "camera_off",
  LOADING: "loading",
  NO_HAND: "no_hand",
  ACTIVE: "active",
  PAUSED: "paused",
};
