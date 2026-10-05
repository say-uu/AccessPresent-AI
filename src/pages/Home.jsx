import { useNavigate } from "react-router-dom";
import { Hand, Target, UploadCloud, Presentation as PresentationIcon } from "lucide-react";
import HeroSection from "../components/home/HeroSection.jsx";
import FeatureCard from "../components/home/FeatureCard.jsx";

const features = [
  {
    icon: Hand,
    title: "Gesture Control",
    description: "Move between slides using natural hand movements — no remote, no keyboard.",
  },
  {
    icon: Target,
    title: "Virtual Pointer",
    description: "Use your index finger to point at important information on your slide.",
  },
  {
    icon: UploadCloud,
    title: "Easy Presentation Upload",
    description: "Upload a PDF presentation and start presenting immediately.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <HeroSection />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-navy-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-purple/10 px-3.5 py-1.5 text-xs font-semibold text-accent-purple mb-5">
              No new software to learn
            </span>
            <h2 className="text-3xl font-semibold text-navy-900 tracking-tight">
              Create Anywhere, Present Here
            </h2>
            <p className="mt-4 text-navy-500 leading-relaxed">
              Design your slides wherever you're most comfortable — PowerPoint,
              Google Slides, Keynote, or any tool you already use. When you're ready
              to present, export your deck as a PDF and upload it to AccessPresent AI
              to control it hands-free.
            </p>
            <p className="mt-4 text-navy-500 leading-relaxed">
              There's nothing to install and nothing to connect — if it can export a
              PDF, AccessPresent AI can turn it into a gesture-controlled
              presentation.
            </p>
            <button
              type="button"
              onClick={() => navigate("/upload")}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-navy-800"
            >
              <PresentationIcon size={16} />
              Upload Your PDF
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["PowerPoint", "Google Slides", "Keynote"].map((tool) => (
              <div
                key={tool}
                className="rounded-xl border border-navy-900/10 bg-mist-50 p-5 text-center"
              >
                <div className="mx-auto mb-3 h-10 w-10 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple" />
                <p className="text-sm font-medium text-navy-700">{tool}</p>
                <p className="text-xs text-navy-400 mt-1">Export as PDF</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
