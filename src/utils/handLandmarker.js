// Loads and caches a single MediaPipe HandLandmarker instance for the whole
// app. The WASM runtime is served locally from /public/mediapipe/wasm (see
// scripts/copy-mediapipe-wasm.mjs); only the ~8MB model file itself is
// fetched from Google's public model CDN on first use, then cached by the
// browser's HTTP cache. Callers should invoke getHandLandmarker() as early
// as a gesture-capable page mounts (not only once the camera turns on) so
// the network fetch + init overlaps with the user granting camera
// permission instead of happening after it.

import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const WASM_BASE_PATH = "/mediapipe/wasm";
const MODEL_ASSET_PATH =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

// GPU init can hang on machines/browsers without a usable WebGL context
// (locked-down corporate devices, some sandboxes) instead of failing fast.
// Bound it so a bad GPU path still falls back to CPU quickly rather than
// leaving the UI stuck on "Loading…" for a long time.
const INIT_TIMEOUT_MS = 4000;

let landmarkerPromise = null;

// Cheap synchronous check so we can skip the GPU attempt (and its timeout)
// entirely on devices that can't do WebGL2, instead of always trying GPU
// first and waiting to find out.
function hasWebGL2() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

function withTimeout(promise, ms, message) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function createLandmarker(fileset, delegate) {
  return HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODEL_ASSET_PATH, delegate },
    runningMode: "VIDEO",
    numHands: 1,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

export function getHandLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE_PATH);

      if (hasWebGL2()) {
        try {
          return await withTimeout(createLandmarker(fileset, "GPU"), INIT_TIMEOUT_MS, "GPU delegate init timed out");
        } catch {
          // Fall through to the CPU delegate below.
        }
      }

      return createLandmarker(fileset, "CPU");
    })().catch((err) => {
      landmarkerPromise = null; // allow retry on next call
      throw err;
    });
  }
  return landmarkerPromise;
}
