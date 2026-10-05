import { Loader2 } from "lucide-react";

export default function LoadingState({ label = "Loading…", size = 20, className = "" }) {
  return (
    <div
      role="status"
      className={`flex items-center justify-center gap-3 text-navy-500 ${className}`}
    >
      <Loader2 size={size} className="animate-spin text-accent-indigo" aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
