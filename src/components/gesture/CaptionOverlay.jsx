/**
 * Live subtitle-style caption shown at the bottom of the slide, driven by
 * useLiveCaptions. Renders nothing while there's no speech to show, so it
 * never blocks slide content when the presenter is quiet.
 */
export default function CaptionOverlay({ text }) {
  if (!text) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-6">
      <p className="max-w-[90%] rounded-xl bg-black/70 px-4 py-2 text-center text-sm font-medium text-white shadow-lg sm:text-base">
        {text}
      </p>
    </div>
  );
}
