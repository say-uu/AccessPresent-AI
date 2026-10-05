import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Camera,
  CameraOff,
  Hand,
  Captions,
  CaptionsOff,
  LifeBuoy,
  LayoutGrid,
  LogOut,
} from "lucide-react";

export default function PresentationControls({
  currentPage,
  numPages,
  onPrev,
  onNext,
  isFirstSlide,
  isLastSlide,
  isFullscreen,
  onToggleFullscreen,
  cameraOn,
  onToggleCamera,
  gesturesEnabled,
  onToggleGestures,
  captionsSupported,
  captionsEnabled,
  onToggleCaptions,
  onRescue,
  onOpenNavigator,
  onExit,
}) {
  return (
    <div
      className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 flex items-center gap-1.5 rounded-2xl bg-navy-900/95 backdrop-blur-sm px-3 py-2.5 shadow-2xl"
      role="toolbar"
      aria-label="Presentation controls"
    >
      <ControlButton label="Previous slide" onClick={onPrev} disabled={isFirstSlide}>
        <ChevronLeft size={20} />
      </ControlButton>

      <span className="px-3 text-sm font-medium tabular-nums text-white/90 select-none min-w-[4.5rem] text-center">
        {currentPage} / {numPages}
      </span>

      <ControlButton label="Next slide" onClick={onNext} disabled={isLastSlide}>
        <ChevronRight size={20} />
      </ControlButton>

      <ControlButton label="Browse & search slides" onClick={onOpenNavigator}>
        <LayoutGrid size={18} />
      </ControlButton>

      <Divider />

      <ControlButton
        label={cameraOn ? "Disable camera" : "Enable Camera"}
        onClick={onToggleCamera}
        active={cameraOn}
      >
        {cameraOn ? <Camera size={18} /> : <CameraOff size={18} />}
      </ControlButton>

      <ControlButton
        label={gesturesEnabled ? "Pause gesture controls" : "Resume gesture controls"}
        onClick={onToggleGestures}
        active={gesturesEnabled}
        disabled={!cameraOn}
      >
        <Hand size={18} />
      </ControlButton>

      <ControlButton
        label={isFullscreen ? "Exit full screen" : "Enter full screen"}
        onClick={onToggleFullscreen}
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </ControlButton>

      <Divider />

      {captionsSupported && (
        <ControlButton
          label={captionsEnabled ? "Turn off live captions" : "Turn on live captions"}
          onClick={onToggleCaptions}
          active={captionsEnabled}
        >
          {captionsEnabled ? <Captions size={18} /> : <CaptionsOff size={18} />}
        </ControlButton>
      )}

      <ControlButton label="I'm stuck — show a cue for this slide" onClick={onRescue} rescue>
        <LifeBuoy size={18} />
      </ControlButton>

      <Divider />

      <ControlButton label="Exit presentation" onClick={onExit} danger>
        <LogOut size={18} />
      </ControlButton>
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-6 w-px bg-white/15" aria-hidden="true" />;
}

function ControlButton({ label, onClick, children, disabled, active, danger, rescue }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        danger
          ? "text-red-300 hover:bg-red-500/15 hover:text-red-200"
          : rescue
            ? "text-amber-400 hover:bg-amber-500/15 hover:text-amber-300"
            : active
              ? "bg-accent-indigo/20 text-accent-blue"
              : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
