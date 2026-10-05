import { useEffect, useRef, useState } from "react";
import { getHandLandmarker } from "../utils/handLandmarker";
import { classifyHandPose, isHandFullyInFrame, indexFingertip } from "../utils/handGeometry";
import {
  GESTURES,
  POSE_HOLD_MS,
  FRAME_EDGE_MARGIN,
  POINTER_SMOOTHING,
  POINTER_DEAD_ZONE,
  sensitivityToConfidenceThreshold,
} from "../utils/gestureConstants";

const EMPTY_STATE = {
  modelStatus: "loading",
  handInFrame: false,
  gesture: GESTURES.NONE,
  confidence: 0,
  isPaused: false,
  pointerPosition: null,
  landmarks: null,
};

/**
 * Runs the MediaPipe HandLandmarker over a live <video> element and turns
 * raw landmarks into safe, debounced gesture events. This hook only detects
 * and classifies — it knows nothing about slides or presentations. Callers
 * subscribe via `onEvent` and decide what each event means for their UI.
 *
 * Emitted events: next, previous, pointer_start, pointer_move, pointer_end,
 * paused, resumed.
 */
export function useGestureEngine({ videoRef, active, settings, onEvent }) {
  const [state, setState] = useState(EMPTY_STATE);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      setState(EMPTY_STATE);
      return undefined;
    }

    let cancelled = false;
    const lastVideoTimeRef = { current: -1 };
    const landmarkerRefLocal = { current: null };
    const poseHold = { current: { gesture: GESTURES.NONE, since: performance.now(), fired: false } };
    const cooldownUntil = { current: 0 };
    const isPaused = { current: false };
    const pointerEma = { current: null };
    const pointerActive = { current: false };

    setState((s) => ({ ...s, modelStatus: "loading" }));

    getHandLandmarker()
      .then((landmarker) => {
        if (cancelled) return;
        landmarkerRefLocal.current = landmarker;
        setState((s) => ({ ...s, modelStatus: "ready" }));
        rafRef.current = requestAnimationFrame(loop);
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, modelStatus: "error" }));
      });

    function loop() {
      const video = videoRef.current;
      const landmarker = landmarkerRefLocal.current;
      if (
        video &&
        landmarker &&
        video.readyState >= 2 &&
        video.currentTime !== lastVideoTimeRef.current
      ) {
        lastVideoTimeRef.current = video.currentTime;
        const result = landmarker.detectForVideo(video, performance.now());
        processResult(result);
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    function emit(event) {
      onEventRef.current?.(event);
    }

    function processResult(result) {
      const s = settingsRef.current;
      const now = performance.now();
      const confidenceThreshold = sensitivityToConfidenceThreshold(s.sensitivity);

      if (!result.landmarks || result.landmarks.length === 0) {
        poseHold.current = { gesture: GESTURES.NONE, since: now, fired: false };
        if (pointerActive.current) {
          pointerActive.current = false;
          emit({ type: "pointer_end" });
        }
        setState({ ...EMPTY_STATE, modelStatus: "ready", isPaused: isPaused.current });
        return;
      }

      const rawLandmarks = result.landmarks[0];
      const handednessScore = result.handednesses?.[0]?.[0]?.score ?? 1;

      // Mirror-correct into "screen space" so pointer position matches what
      // the user sees in the (mirrored) preview.
      const landmarks = s.mirrorCamera
        ? rawLandmarks.map((lm) => ({ x: 1 - lm.x, y: lm.y, z: lm.z }))
        : rawLandmarks;

      const inFrame = isHandFullyInFrame(rawLandmarks, FRAME_EDGE_MARGIN);
      if (!inFrame) {
        setState({
          modelStatus: "ready",
          handInFrame: false,
          gesture: GESTURES.NONE,
          confidence: 0,
          pointerPosition: null,
          landmarks,
          isPaused: isPaused.current,
        });
        return;
      }

      const { gesture: rawGesture, confidence } = classifyHandPose(landmarks);
      const meetsConfidence = confidence >= confidenceThreshold && handednessScore >= 0.5;
      const gesture = meetsConfidence ? rawGesture : GESTURES.NONE;

      // ---- Static pose hold logic (fist / open palm / thumbs up / thumbs down) ----
      // Every pose fires at most once per continuous hold: the `fired` flag
      // is set as soon as POSE_HOLD_MS elapses, regardless of whether the
      // action below actually runs (e.g. blocked by cooldown), so the user
      // must release and re-form the pose to trigger it again.
      const hold = poseHold.current;
      if (gesture !== hold.gesture) {
        poseHold.current = { gesture, since: now, fired: false };
      } else if (!hold.fired && now - hold.since >= POSE_HOLD_MS) {
        poseHold.current = { ...hold, fired: true };
        const canAct = now >= cooldownUntil.current;
        if (gesture === GESTURES.FIST && !isPaused.current) {
          isPaused.current = true;
          emit({ type: "paused" });
        } else if (gesture === GESTURES.OPEN_PALM && isPaused.current) {
          isPaused.current = false;
          emit({ type: "resumed" });
        } else if (gesture === GESTURES.THUMBS_UP && !isPaused.current && canAct) {
          cooldownUntil.current = now + s.cooldownMs;
          emit({ type: "next" });
        } else if (gesture === GESTURES.THUMBS_DOWN && !isPaused.current && canAct) {
          cooldownUntil.current = now + s.cooldownMs;
          emit({ type: "previous" });
        }
      }

      // ---- Pointer (index finger raised) ----
      let pointerPosition = null;
      if (!isPaused.current && gesture === GESTURES.POINTER) {
        const tip = indexFingertip(landmarks);
        if (!pointerEma.current) {
          pointerEma.current = { x: tip.x, y: tip.y };
        } else {
          const dx = tip.x - pointerEma.current.x;
          const dy = tip.y - pointerEma.current.y;
          if (Math.hypot(dx, dy) > POINTER_DEAD_ZONE) {
            pointerEma.current = {
              x: pointerEma.current.x + dx * POINTER_SMOOTHING,
              y: pointerEma.current.y + dy * POINTER_SMOOTHING,
            };
          }
        }
        pointerPosition = { ...pointerEma.current };
        if (!pointerActive.current) {
          pointerActive.current = true;
          emit({ type: "pointer_start" });
        }
        emit({ type: "pointer_move", point: pointerPosition });
      } else if (pointerActive.current) {
        pointerActive.current = false;
        pointerEma.current = null;
        emit({ type: "pointer_end" });
      }

      setState({
        modelStatus: "ready",
        handInFrame: true,
        gesture,
        confidence,
        isPaused: isPaused.current,
        pointerPosition,
        landmarks,
      });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, videoRef]);

  return state;
}
