import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, UploadCloud, Monitor } from "lucide-react";
import { usePresentation } from "../context/PresentationContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import { useWebcam } from "../hooks/useWebcam.js";
import { useGestureEngine } from "../hooks/useGestureEngine.js";
import { useLiveCaptions } from "../hooks/useLiveCaptions.js";
import { getHandLandmarker } from "../utils/handLandmarker.js";
import { extractPageLines, buildRescueCue } from "../utils/slideText.js";
import PDFViewer from "../components/pdf/PDFViewer.jsx";
import PresentationControls from "../components/presentation/PresentationControls.jsx";
import RescuePanel from "../components/presentation/RescuePanel.jsx";
import SlideNavigator from "../components/presentation/SlideNavigator.jsx";
import PaceTracker from "../components/presentation/PaceTracker.jsx";
import WebcamPreview from "../components/gesture/WebcamPreview.jsx";
import VirtualPointer from "../components/gesture/VirtualPointer.jsx";
import CaptionOverlay from "../components/gesture/CaptionOverlay.jsx";
import GestureNotification from "../components/gesture/GestureNotification.jsx";
import GestureSettings from "../components/settings/GestureSettings.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

let notificationCounter = 0;

export default function Presentation() {
  const navigate = useNavigate();
  const { pdfDoc, numPages, currentPage, status, nextSlide, prevSlide, goToPage, isFirstSlide, isLastSlide } =
    usePresentation();
  const { settings, updateSetting } = useSettings();

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const { cameraState, start: startCamera, stop: stopCamera } = useWebcam(videoRef);
  const cameraOn = cameraState === "on";

  const [gesturesManuallyEnabled, setGesturesManuallyEnabled] = useState(true);
  const [pointerPosition, setPointerPosition] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [camMinimized, setCamMinimized] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [rescueCue, setRescueCue] = useState(null);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [indexing, setIndexing] = useState(false);
  const notificationTimerRef = useRef(null);
  // Shared cache of each slide's extracted text lines — built lazily, one
  // page at a time, and reused by both the rescue cue (just the current
  // page) and the slide search index (every page). Avoids re-running
  // pdf.js text extraction for a page more than once.
  const pageLinesCacheRef = useRef(new Map());

  const { supported: captionsSupported, text: captionText } = useLiveCaptions({
    active: settings.captionsEnabled,
  });

  const getPageLines = useCallback(
    async (pageNumber) => {
      if (pageLinesCacheRef.current.has(pageNumber)) {
        return pageLinesCacheRef.current.get(pageNumber);
      }
      const lines = await extractPageLines(pdfDoc, pageNumber);
      pageLinesCacheRef.current.set(pageNumber, lines);
      return lines;
    },
    [pdfDoc]
  );

  // A cue for one slide isn't relevant to the next, so hide it on navigation
  // rather than leaving stale text up while a different slide is showing.
  useEffect(() => {
    setRescueCue(null);
  }, [currentPage]);

  const handleRescue = useCallback(async () => {
    try {
      const lines = await getPageLines(currentPage);
      setRescueCue(buildRescueCue(lines));
    } catch {
      setRescueCue({
        suggestion: "Couldn't read this slide's text — describe what's on screen in your own words.",
        points: [],
      });
    }
  }, [currentPage, getPageLines]);

  // ---- Slide browser / search ----
  const openNavigator = useCallback(() => {
    setNavigatorOpen(true);
    setSearchQuery("");
  }, []);

  useEffect(() => {
    if (!navigatorOpen) return undefined;
    let cancelled = false;
    setIndexing(true);
    (async () => {
      for (let p = 1; p <= numPages; p += 1) {
        if (cancelled) return;
        await getPageLines(p).catch(() => {});
      }
      if (!cancelled) setIndexing(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigatorOpen, numPages, getPageLines]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null; // no query -> caller shows every slide
    const matches = [];
    for (let p = 1; p <= numPages; p += 1) {
      const lines = pageLinesCacheRef.current.get(p) || [];
      const hit = lines.find((line) => line.toLowerCase().includes(q));
      if (hit) matches.push({ page: p, snippet: hit });
    }
    return matches;
    // Re-run once background indexing finishes filling the cache, even
    // though `indexing` itself isn't read in the body above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, numPages, indexing]);

  const handleJumpToSlide = useCallback(
    (page) => {
      goToPage(page);
      setNavigatorOpen(false);
    },
    [goToPage]
  );

  // ---- Pace tracker ----
  const presentationStartRef = useRef(Date.now());
  const slideStartRef = useRef(Date.now());
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    slideStartRef.current = Date.now();
  }, [currentPage]);

  const totalElapsedSec = Math.floor((Date.now() - presentationStartRef.current) / 1000);
  const slideElapsedSec = Math.floor((Date.now() - slideStartRef.current) / 1000);
  const perSlideBudgetSec =
    settings.presentationDurationMinutes > 0 ? (settings.presentationDurationMinutes * 60) / numPages : null;
  const paceStatus = !perSlideBudgetSec
    ? "ok"
    : slideElapsedSec > perSlideBudgetSec * 1.5
      ? "over"
      : slideElapsedSec > perSlideBudgetSec
        ? "warn"
        : "ok";

  const showNotification = useCallback(
    (type) => {
      if (!settings.notificationsEnabled) return;
      notificationCounter += 1;
      setNotification({ id: notificationCounter, type });
      clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = setTimeout(() => setNotification(null), 1800);
    },
    [settings.notificationsEnabled]
  );

  const handleGestureEvent = useCallback(
    (event) => {
      if (!gesturesManuallyEnabled) return;
      switch (event.type) {
        case "next":
          nextSlide();
          showNotification("next");
          break;
        case "previous":
          prevSlide();
          showNotification("previous");
          break;
        case "pointer_start":
          showNotification("pointer_on");
          break;
        case "pointer_move":
          setPointerPosition(event.point);
          break;
        case "pointer_end":
          setPointerPosition(null);
          break;
        case "paused":
          showNotification("paused");
          break;
        case "resumed":
          showNotification("resumed");
          break;
        default:
          break;
      }
    },
    [gesturesManuallyEnabled, nextSlide, prevSlide, showNotification]
  );

  const engineState = useGestureEngine({
    videoRef,
    active: cameraOn,
    settings,
    onEvent: handleGestureEvent,
  });

  // Start fetching/initializing the hand-tracking model as soon as this page
  // mounts, in parallel with the user granting camera permission, instead of
  // waiting until the camera is already on to start loading it.
  useEffect(() => {
    getHandLandmarker().catch(() => {});
  }, []);

  useEffect(() => {
    if (!gesturesManuallyEnabled) setPointerPosition(null);
  }, [gesturesManuallyEnabled]);

  // ---- Fullscreen ----
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // ---- Keyboard controls ----
  useEffect(() => {
    function onKeyDown(e) {
      if (settingsOpen) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleRescue();
      }
      // Escape is handled natively by the Fullscreen API.
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [settingsOpen, nextSlide, prevSlide, handleRescue]);

  const handleExit = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    navigate("/upload");
  }, [navigate]);

  const slideAreaClasses = useMemo(
    () => "relative w-full max-w-6xl aspect-video bg-white rounded-2xl shadow-2xl overflow-hidden",
    []
  );

  if (status !== "ready") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4">
        <div className="max-w-md w-full">
          <ErrorMessage
            icon={UploadCloud}
            title="No presentation uploaded"
            description="Upload a PDF to start a gesture-controlled presentation."
            actionLabel="Upload Presentation"
            onAction={() => navigate("/upload")}
            tone="neutral"
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative min-h-screen w-full bg-navy-950 flex flex-col overflow-hidden">
      <div className="md:hidden bg-amber-500/10 text-amber-200 text-xs text-center px-4 py-2 flex items-center justify-center gap-2">
        <Monitor size={14} />
        For the best gesture-control experience, use a laptop or desktop.
      </div>

      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        aria-label="Open gesture settings"
        className="absolute top-4 right-4 z-40 rounded-full bg-white/10 p-2.5 text-white/80 hover:bg-white/20 hover:text-white"
      >
        <Settings size={18} />
      </button>

      {settings.paceTrackerEnabled && (
        <PaceTracker totalElapsedSec={totalElapsedSec} slideElapsedSec={slideElapsedSec} status={paceStatus} />
      )}

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12">
        <div className={slideAreaClasses}>
          <PDFViewer pdfDoc={pdfDoc} pageNumber={currentPage} className="h-full" />
          {gesturesManuallyEnabled && (
            <VirtualPointer position={pointerPosition} size={settings.pointerSize} />
          )}
          {settings.captionsEnabled && <CaptionOverlay text={captionText} />}
          <RescuePanel cue={rescueCue} onClose={() => setRescueCue(null)} />
        </div>
      </div>

      <PresentationControls
        currentPage={currentPage}
        numPages={numPages}
        onPrev={prevSlide}
        onNext={nextSlide}
        isFirstSlide={isFirstSlide}
        isLastSlide={isLastSlide}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        cameraOn={cameraOn}
        onToggleCamera={() => (cameraOn ? stopCamera() : startCamera())}
        gesturesEnabled={gesturesManuallyEnabled}
        onToggleGestures={() => setGesturesManuallyEnabled((v) => !v)}
        captionsSupported={captionsSupported}
        captionsEnabled={settings.captionsEnabled}
        onToggleCaptions={() => updateSetting("captionsEnabled", !settings.captionsEnabled)}
        onRescue={handleRescue}
        onOpenNavigator={openNavigator}
        onExit={handleExit}
      />

      <SlideNavigator
        open={navigatorOpen}
        onClose={() => setNavigatorOpen(false)}
        pdfDoc={pdfDoc}
        numPages={numPages}
        currentPage={currentPage}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        indexing={indexing}
        results={searchResults}
        onJump={handleJumpToSlide}
      />

      {settings.showWebcam && (
        <WebcamPreview
          videoRef={videoRef}
          cameraState={cameraState}
          modelStatus={engineState.modelStatus}
          landmarks={engineState.landmarks}
          gesture={engineState.gesture}
          confidence={engineState.confidence}
          handInFrame={engineState.handInFrame}
          isPaused={engineState.isPaused || !gesturesManuallyEnabled}
          showLandmarks={settings.showLandmarks}
          mirrorCamera={settings.mirrorCamera}
          onEnableCamera={startCamera}
          isMinimized={camMinimized}
          onToggleMinimize={() => setCamMinimized((v) => !v)}
        />
      )}

      <GestureNotification notification={notification} />
      <GestureSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
