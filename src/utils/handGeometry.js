// Pure geometry helpers that turn 21 MediaPipe hand landmarks into a
// classified static pose (fist / open palm / index pointer / thumbs
// up / thumbs down) plus a confidence score. Kept dependency-free so it
// can be unit tested in isolation from the camera/React layers.

import { GESTURES } from "./gestureConstants";

const WRIST = 0;
const MIDDLE_MCP = 9;
const FINGERS = {
  thumb: { mcp: 2, pip: 3, tip: 4 },
  index: { mcp: 5, pip: 6, tip: 8 },
  middle: { mcp: 9, pip: 10, tip: 12 },
  ring: { mcp: 13, pip: 14, tip: 16 },
  pinky: { mcp: 17, pip: 18, tip: 20 },
};

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

// Ratio of (wrist->tip) to (wrist->pip) distance. Works regardless of hand
// rotation/orientation, unlike a simple "tip.y < pip.y" check.
function extensionRatio(landmarks, finger) {
  const wrist = landmarks[WRIST];
  const { pip, tip } = FINGERS[finger];
  const pipDist = dist(wrist, landmarks[pip]) || 0.0001;
  const tipDist = dist(wrist, landmarks[tip]);
  return tipDist / pipDist;
}

function extendedScore(ratio) {
  return clamp01((ratio - 1.0) / 0.4);
}

function curledScore(ratio) {
  return clamp01((1.0 - ratio) / 0.3);
}

/**
 * Classifies a single hand's landmarks into one of the supported static
 * poses, returning a 0-1 confidence for the winning pose.
 */
export function classifyHandPose(landmarks) {
  const ratios = {
    thumb: extensionRatio(landmarks, "thumb"),
    index: extensionRatio(landmarks, "index"),
    middle: extensionRatio(landmarks, "middle"),
    ring: extensionRatio(landmarks, "ring"),
    pinky: extensionRatio(landmarks, "pinky"),
  };

  const middleRingPinkyCurled =
    (curledScore(ratios.middle) + curledScore(ratios.ring) + curledScore(ratios.pinky)) / 3;

  const fourCurled = (curledScore(ratios.index) + middleRingPinkyCurled * 3) / 4;

  const pointerConfidence = (extendedScore(ratios.index) + middleRingPinkyCurled * 3) / 4;

  // A true fist needs the thumb tucked in too, distinguishing it from
  // thumbs-up/down (which also curl the four fingers but extend the thumb).
  const fistConfidence = (curledScore(ratios.thumb) + fourCurled * 4) / 5;

  const openPalmConfidence =
    (extendedScore(ratios.index) +
      extendedScore(ratios.middle) +
      extendedScore(ratios.ring) +
      extendedScore(ratios.pinky)) /
    4;

  // Thumbs up/down: four fingers curled, thumb extended, and the thumb tip
  // sits clearly above/below the wrist. The vertical offset is normalized
  // by palm length (wrist-to-middle-MCP) so it works regardless of how
  // close the hand is to the camera.
  const handScale = dist(landmarks[WRIST], landmarks[MIDDLE_MCP]) || 0.0001;
  const verticalOffset = (landmarks[WRIST].y - landmarks[FINGERS.thumb.tip].y) / handScale;
  const thumbExtended = extendedScore(ratios.thumb);
  const upDirection = clamp01((verticalOffset - 0.2) / 0.5);
  const downDirection = clamp01((-verticalOffset - 0.2) / 0.5);

  const thumbsUpConfidence = (thumbExtended + fourCurled + upDirection) / 3;
  const thumbsDownConfidence = (thumbExtended + fourCurled + downDirection) / 3;

  const candidates = [
    { gesture: GESTURES.POINTER, confidence: pointerConfidence },
    { gesture: GESTURES.FIST, confidence: fistConfidence },
    { gesture: GESTURES.OPEN_PALM, confidence: openPalmConfidence },
    { gesture: GESTURES.THUMBS_UP, confidence: thumbsUpConfidence },
    { gesture: GESTURES.THUMBS_DOWN, confidence: thumbsDownConfidence },
  ];

  candidates.sort((a, b) => b.confidence - a.confidence);
  const best = candidates[0];

  return { gesture: best.gesture, confidence: best.confidence, ratios };
}

/** True if every landmark sits comfortably inside the frame (with margin). */
export function isHandFullyInFrame(landmarks, margin) {
  return landmarks.every(
    (lm) =>
      lm.x >= margin && lm.x <= 1 - margin && lm.y >= margin && lm.y <= 1 - margin
  );
}

export function indexFingertip(landmarks) {
  return landmarks[FINGERS.index.tip];
}
