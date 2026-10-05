/**
 * Circular pointer rendered over the slide, driven by the index-fingertip
 * position from the gesture engine (already smoothed there). Must be
 * placed inside a `position: relative` wrapper matching the slide bounds.
 */
export default function VirtualPointer({ position, size = 28 }) {
  if (!position) return null;

  const x = Math.min(Math.max(position.x, 0), 1);
  const y = Math.min(Math.max(position.y, 0), 1);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-30 rounded-full"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        background:
          "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(79,124,255,0.85) 45%, rgba(139,92,246,0.85) 100%)",
        boxShadow: "0 0 0 3px rgba(255,255,255,0.9), 0 4px 14px rgba(79,124,255,0.5)",
        transition: "left 60ms linear, top 60ms linear",
      }}
    />
  );
}
