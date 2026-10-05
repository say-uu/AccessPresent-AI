export default function GestureInstructionCard({ icon: Icon, name, action, instruction, isActive }) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        isActive
          ? "border-accent-indigo bg-accent-indigo/5 shadow-md"
          : "border-navy-900/10 bg-white shadow-sm"
      }`}
    >
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${
          isActive ? "bg-accent-indigo text-white" : "bg-mist-100 text-accent-indigo"
        }`}
      >
        <Icon size={20} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-navy-900">{name}</h3>
      <p className="mt-1 text-sm font-medium text-accent-indigo">{action}</p>
      <p className="mt-2 text-sm text-navy-500 leading-relaxed">{instruction}</p>
    </div>
  );
}
