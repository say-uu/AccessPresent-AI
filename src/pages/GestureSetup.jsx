import { useCallback, useEffect, useRef, useState } from "react";
import { Hand, Pointer, Sparkles, RadioTower, ThumbsUp, ThumbsDown } from "lucide-react";
import { useSettings } from "../context/SettingsContext.jsx";
import { useWebcam } from "../hooks/useWebcam.js";
import { useGestureEngine } from "../hooks/useGestureEngine.js";
import { getHandLandmarker } from "../utils/handLandmarker.js";
import WebcamPreview from "../components/gesture/WebcamPreview.jsx";
import GestureInstructionCard from "../components/gesture/GestureInstructionCard.jsx";
import { GESTURES } from "../utils/gestureConstants";

const INSTRUCTIONS = [
  {
    gesture: GESTURES.THUMBS_UP,
    icon: ThumbsUp,
    name: "Thumbs Up",
    action: "Moves to the next slide",
    instruction: "Curl your fingers into a fist and point your thumb straight up, holding steady for a moment.",
  },
  {
    gesture: GESTURES.THUMBS_DOWN,
    icon: ThumbsDown,
    name: "Thumbs Down",
    action: "Moves to the previous slide",
    instruction: "Curl your fingers into a fist and point your thumb straight down, holding steady for a moment.",
  },
  {
    gesture: GESTURES.POINTER,
    icon: Pointer,
    name: "Index Finger Pointer",
    action: "Activates the virtual pointer",
    instruction: "Extend only your index finger while keeping the other fingers folded down.",
  },
  {
    gesture: GESTURES.OPEN_PALM,
    icon: Hand,
    name: "Open Palm",
    action: "Resumes gesture controls",
    instruction: "Hold your palm open with all fingers extended and facing the camera.",
  },
  {
    gesture: GESTURES.FIST,
    icon: Hand,
    name: "Closed Fist",
    action: "Pauses gesture controls",
    instruction: "Curl all fingers into your palm to make a closed fist and hold it steady.",
  },
];

let logCounter = 0;

export default function GestureSetup() {
  const { settings } = useSettings();
  const videoRef = useRef(null);
  const { cameraState, start: startCamera } = useWebcam(videoRef);
  const [messageLog, setMessageLog] = useState([]);

  // Start fetching/initializing the hand-tracking model as soon as this page
  // mounts, in parallel with the user granting camera permission, instead of
  // waiting until the camera is already on to start loading it.
  useEffect(() => {
    getHandLandmarker().catch(() => {});
  }, []);

  const pushMessage = useCallback((text, tone = "info") => {
    logCounter += 1;
    setMessageLog((prev) => [{ id: logCounter, text, tone }, ...prev].slice(0, 6));
  }, []);

  const handleEvent = useCallback(
    (event) => {
      switch (event.type) {
        case "next":
          pushMessage("Great! Thumbs up detected — next slide.", "success");
          break;
        case "previous":
          pushMessage("Great! Thumbs down detected — previous slide.", "success");
          break;
        case "pointer_start":
          pushMessage("Index finger pointer recognized.", "success");
          break;
        case "paused":
          pushMessage("Closed fist detected — gesture controls paused.", "success");
          break;
        case "resumed":
          pushMessage("Open palm detected — gesture controls resumed.", "success");
          break;
        default:
          break;
      }
    },
    [pushMessage]
  );

  const engineState = useGestureEngine({
    videoRef,
    active: cameraState === "on",
    settings,
    onEvent: handleEvent,
  });

  const handleCalibrate = useCallback(() => {
    if (cameraState !== "on") {
      startCamera();
    }
    setMessageLog([]);
    pushMessage("Calibration started — try each gesture below.", "info");
  }, [cameraState, startCamera, pushMessage]);

  const liveHint = getLiveHint(cameraState, engineState);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-navy-900 tracking-tight">
          Gesture Setup
        </h1>
        <p className="mt-3 text-navy-500 max-w-xl mx-auto">
          Test your gestures here before presenting, so you know exactly how
          AccessPresent AI reads your hand.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 mb-14">
        <div className="lg:col-span-3">
          <WebcamPreview
            videoRef={videoRef}
            cameraState={cameraState}
            modelStatus={engineState.modelStatus}
            landmarks={engineState.landmarks}
            gesture={engineState.gesture}
            confidence={engineState.confidence}
            handInFrame={engineState.handInFrame}
            isPaused={engineState.isPaused}
            showLandmarks={settings.showLandmarks}
            mirrorCamera={settings.mirrorCamera}
            onEnableCamera={startCamera}
            isMinimized={false}
            onToggleMinimize={() => {}}
            size="lg"
          />

          <button
            type="button"
            onClick={handleCalibrate}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] hover:bg-navy-800"
          >
            <RadioTower size={16} />
            Start Calibration
          </button>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm flex flex-col">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-navy-900 mb-3">
            <Sparkles size={16} className="text-accent-indigo" />
            Live Testing Feedback
          </h2>

          <p className="text-sm text-navy-600 mb-4">{liveHint}</p>

          <div className="flex-1 space-y-2 overflow-y-auto thin-scrollbar max-h-72">
            {messageLog.length === 0 && (
              <p className="text-xs text-navy-400">
                Detected gestures will appear here as you test them.
              </p>
            )}
            {messageLog.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  m.tone === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-mist-100 text-navy-600"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-navy-900 mb-5">Gesture Guide</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {INSTRUCTIONS.map((item) => (
          <GestureInstructionCard
            key={item.name}
            icon={item.icon}
            name={item.name}
            action={item.action}
            instruction={item.instruction}
            isActive={engineState.gesture === item.gesture}
          />
        ))}
      </div>
    </section>
  );
}

function getLiveHint(cameraState, engineState) {
  if (cameraState !== "on") return "Enable your camera to begin testing your gestures.";
  if (engineState.modelStatus === "loading") return "Loading the gesture recognition model…";
  if (engineState.modelStatus === "error")
    return "Gesture recognition failed to load. Check your connection and reload the page.";
  if (!engineState.handInFrame)
    return "No hand detected. Keep your hand inside the camera frame.";
  if (engineState.gesture === GESTURES.NONE)
    return "Hand detected — hold one of the gesture poses below to test it.";
  if (engineState.gesture === GESTURES.POINTER) return "Pointer gesture recognized successfully.";
  if (engineState.gesture === GESTURES.FIST) return "Closed fist recognized successfully.";
  if (engineState.gesture === GESTURES.OPEN_PALM) return "Open palm recognized successfully.";
  if (engineState.gesture === GESTURES.THUMBS_UP) return "Thumbs up recognized successfully.";
  if (engineState.gesture === GESTURES.THUMBS_DOWN) return "Thumbs down recognized successfully.";
  return "Move your hand slightly and try a gesture from the cards below.";
}
