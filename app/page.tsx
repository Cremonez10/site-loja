import AgeGate from '../components/age/AgeGate';

export default function HomePage() {
  return (
    <AgeGate>
      <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
        <section className="mx-auto max-w-screen-md space-y-6">
          <h1 className="text-3xl font-semibold">JoFogo</h1>
          <p className="text-base leading-7 text-slate-300">Catálogo discreto e mobile-first.</p>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/40">
            <p className="text-slate-200">O catálogo será liberado em etapas futuras.</p>
          </div>
        </section>
      </main>
    </AgeGate>
  );
}
