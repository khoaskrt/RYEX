export function ModuleCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_80px_-40px_rgba(1,188,141,0.5)]">
      <h1 className="mb-2 text-2xl font-bold">{title}</h1>
      <p className="mb-6 max-w-2xl text-slate-300">{description}</p>
      {children}
    </section>
  );
}
