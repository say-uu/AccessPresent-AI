export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group rounded-2xl border border-navy-900/10 bg-white p-7 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue/15 to-accent-purple/15 text-accent-indigo transition-colors group-hover:from-accent-blue group-hover:to-accent-purple group-hover:text-white">
        <Icon size={22} strokeWidth={2} aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-navy-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-navy-500">{description}</p>
    </div>
  );
}
