import { AlertTriangle } from "lucide-react";

/**
 * Polished error/empty-state block: explains the problem and gives the user
 * a clear next action, per the app's "no dead-end states" requirement.
 */
export default function ErrorMessage({
  icon: Icon = AlertTriangle,
  title,
  description,
  actionLabel,
  onAction,
  tone = "error", // "error" | "neutral"
}) {
  const toneClasses =
    tone === "error"
      ? "bg-red-50 text-red-600 border-red-100"
      : "bg-mist-100 text-navy-500 border-navy-900/10";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className="flex flex-col items-center text-center gap-4 rounded-2xl border border-navy-900/10 bg-white p-8 shadow-sm"
    >
      <span className={`flex h-14 w-14 items-center justify-center rounded-full border ${toneClasses}`}>
        <Icon size={26} aria-hidden="true" />
      </span>
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
        {description && <p className="text-sm text-navy-500 max-w-sm">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-indigo px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-indigo-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
