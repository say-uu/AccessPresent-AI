import { useNavigate } from "react-router-dom";
import { Upload, PlayCircle, Hand, Video, Radio } from "lucide-react";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-blue/5 via-transparent to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-14 items-center">
        <div className="text-center md:text-left animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-indigo/10 px-3.5 py-1.5 text-xs font-semibold text-accent-indigo mb-6">
            <Radio size={14} /> Runs entirely in your browser
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-navy-900 leading-[1.05]">
            Control Your Presentation Naturally
          </h1>
          <p className="mt-6 text-lg text-navy-500 max-w-xl mx-auto md:mx-0">
            Upload your slides, enable your camera and control your presentation
            using simple hand gestures. Present confidently without touching a
            keyboard or remote.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <button
              type="button"
              onClick={() => navigate("/upload")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] hover:bg-navy-800"
            >
              <Upload size={18} />
              Upload Presentation
            </button>
            <button
              type="button"
              onClick={() => navigate("/how-it-works")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-900/15 bg-white px-6 py-3.5 text-sm font-semibold text-navy-800 shadow-sm transition-transform hover:scale-[1.02] hover:bg-mist-100"
            >
              <PlayCircle size={18} />
              See How It Works
            </button>
          </div>
        </div>

        <div className="animate-slide-up">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}

/** Static illustrative mockup — not a live camera, purely visual marketing. */
function HeroMockup() {
  return (
    <div className="relative mx-auto max-w-md">
      <div className="rounded-2xl border border-navy-900/10 bg-white shadow-xl p-4">
        <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-navy-900 to-navy-800 flex flex-col items-center justify-center text-white relative overflow-hidden">
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
          </div>
          <p className="text-xs uppercase tracking-widest text-white/50">Slide 3 / 12</p>
          <h3 className="mt-2 text-xl font-semibold px-6 text-center">Quarterly Growth Overview</h3>
          <div className="mt-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple" />

          {/* Webcam preview card */}
          <div className="absolute bottom-3 right-3 w-28 rounded-lg border border-white/20 bg-navy-950/80 backdrop-blur-sm p-1.5">
            <div className="relative aspect-video rounded-md bg-navy-800 flex items-center justify-center overflow-hidden">
              <Hand size={26} className="text-accent-blue animate-pulse-soft" strokeWidth={1.8} />
              <span className="absolute top-1 left-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
            <p className="mt-1 flex items-center gap-1 text-[9px] font-medium text-emerald-300">
              <Video size={9} /> Gesture: Thumbs Up
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-navy-500">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-600 px-2.5 py-1 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Gestures Active
          </span>
          <span>Next slide detected</span>
        </div>
      </div>
    </div>
  );
}
