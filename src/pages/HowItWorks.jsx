import { useNavigate } from "react-router-dom";
import { LayoutTemplate, FileDown, UploadCloud, Hand, ArrowRight, UploadCloud as UploadIcon } from "lucide-react";

const STEPS = [
  {
    icon: LayoutTemplate,
    title: "Create your presentation",
    description: "Design your slides in PowerPoint, Google Slides, Keynote — whatever tool you already use.",
  },
  {
    icon: FileDown,
    title: "Export as a PDF",
    description: "Use your tool's export or download option to save your finished presentation as a PDF file.",
  },
  {
    icon: UploadCloud,
    title: "Upload to AccessPresent AI",
    description: "Drag and drop your PDF into AccessPresent AI. Your slides render instantly, right in the browser.",
  },
  {
    icon: Hand,
    title: "Present with gestures",
    description: "Enable your camera and control your slides naturally — thumbs up, point and pause with your hand.",
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="text-center mb-14">
        <h1 className="text-3xl md:text-4xl font-semibold text-navy-900 tracking-tight">
          How It Works
        </h1>
        <p className="mt-3 text-navy-500 max-w-xl mx-auto">
          From finished slides to a hands-free presentation in four simple steps.
        </p>
      </div>

      <div className="relative">
        <div className="hidden md:block absolute top-9 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-accent-blue via-accent-indigo to-accent-purple" />
        <div className="grid md:grid-cols-4 gap-8 md:gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              <span className="relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-white border-2 border-accent-indigo/30 shadow-sm">
                <step.icon size={26} className="text-accent-indigo" />
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
              </span>
              <h3 className="mt-5 text-base font-semibold text-navy-900">{step.title}</h3>
              <p className="mt-2 text-sm text-navy-500 leading-relaxed max-w-[15rem]">
                {step.description}
              </p>
              {i < STEPS.length - 1 && (
                <ArrowRight size={18} className="md:hidden mt-4 text-navy-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-2xl border border-navy-900/10 bg-white p-8 shadow-sm text-center">
        <h2 className="text-xl font-semibold text-navy-900">Ready to try it yourself?</h2>
        <p className="mt-2 text-navy-500 max-w-md mx-auto">
          No account, no installs — export a PDF and you're ready to present hands-free.
        </p>
        <button
          type="button"
          onClick={() => navigate("/upload")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-navy-800"
        >
          <UploadIcon size={16} />
          Upload Presentation
        </button>
      </div>
    </section>
  );
}
