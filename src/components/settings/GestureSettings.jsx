import { X, RotateCcw } from "lucide-react";
import { useSettings } from "../../context/SettingsContext.jsx";

export default function GestureSettings({ open, onClose }) {
  const { settings, updateSetting, resetSettings } = useSettings();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-[1px] animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out thin-scrollbar overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Gesture settings"
      >
        <div className="flex items-center justify-between border-b border-navy-900/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-navy-900">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-lg p-2 text-navy-500 hover:bg-mist-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-7">
          <SliderRow
            label="Gesture sensitivity"
            hint="Higher makes gestures easier to trigger, but more prone to false positives."
            value={settings.sensitivity}
            min={0.2}
            max={1}
            step={0.05}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => updateSetting("sensitivity", v)}
          />

          <SliderRow
            label="Gesture cooldown duration"
            hint="Minimum time between slide changes to prevent accidental double-triggers."
            value={settings.cooldownMs}
            min={500}
            max={2000}
            step={100}
            format={(v) => `${(v / 1000).toFixed(1)}s`}
            onChange={(v) => updateSetting("cooldownMs", v)}
          />

          <SliderRow
            label="Pointer size"
            hint="Diameter of the virtual pointer shown on the slide."
            value={settings.pointerSize}
            min={12}
            max={48}
            step={2}
            format={(v) => `${v}px`}
            onChange={(v) => updateSetting("pointerSize", v)}
          />

          <SliderRow
            label="Target presentation length"
            hint="Sets a per-slide time budget for the pace tracker. Leave at 0 for a plain clock with no pace warnings."
            value={settings.presentationDurationMinutes}
            min={0}
            max={90}
            step={1}
            format={(v) => (v === 0 ? "No target" : `${v} min`)}
            onChange={(v) => updateSetting("presentationDurationMinutes", v)}
          />

          <div className="space-y-4 border-t border-navy-900/10 pt-6">
            <ToggleRow
              label="Show webcam preview"
              checked={settings.showWebcam}
              onChange={(v) => updateSetting("showWebcam", v)}
            />
            <ToggleRow
              label="Show hand landmarks"
              checked={settings.showLandmarks}
              onChange={(v) => updateSetting("showLandmarks", v)}
            />
            <ToggleRow
              label="Mirror camera"
              checked={settings.mirrorCamera}
              onChange={(v) => updateSetting("mirrorCamera", v)}
            />
            <ToggleRow
              label="Gesture notifications"
              checked={settings.notificationsEnabled}
              onChange={(v) => updateSetting("notificationsEnabled", v)}
            />
            <ToggleRow
              label="Live captions"
              hint="Shows your speech as captions on the slide. Uses the microphone; Chrome/Edge only."
              checked={settings.captionsEnabled}
              onChange={(v) => updateSetting("captionsEnabled", v)}
            />
            <ToggleRow
              label="Show pace tracker"
              hint="A small on-screen clock showing elapsed time and, if a target length is set above, whether you're on pace."
              checked={settings.paceTrackerEnabled}
              onChange={(v) => updateSetting("paceTrackerEnabled", v)}
            />
          </div>

          <button
            type="button"
            onClick={resetSettings}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-900/15 px-4 py-2.5 text-sm font-semibold text-navy-700 hover:bg-mist-100"
          >
            <RotateCcw size={15} />
            Reset to defaults
          </button>
        </div>
      </aside>
    </>
  );
}

function SliderRow({ label, hint, value, min, max, step, format, onChange }) {
  const id = `setting-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="text-sm font-medium text-navy-800">
          {label}
        </label>
        <span className="text-xs font-semibold text-accent-indigo tabular-nums">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-accent-indigo"
      />
      {hint && <p className="mt-1 text-xs text-navy-400">{hint}</p>}
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div>
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-medium text-navy-800">{label}</span>
        <span className="relative inline-flex h-6 w-11 items-center shrink-0">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
          />
          <span className="absolute inset-0 rounded-full bg-navy-900/15 transition-colors peer-checked:bg-accent-indigo" />
          <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </span>
      </label>
      {hint && <p className="mt-1 text-xs text-navy-400">{hint}</p>}
    </div>
  );
}
