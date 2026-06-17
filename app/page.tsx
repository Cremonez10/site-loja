export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      <section className="mx-auto max-w-screen-md space-y-6">
        <h1 className="text-3xl font-semibold">JoFogo</h1>
        <p className="text-base leading-7 text-slate-300">
          Catálogo discreto e mobile-first com confirmação 18+, produtos e mini-pedido.
        </p>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/40">
          <p className="text-slate-200">Este é o esqueleto inicial do projeto. As páginas públicas e admin serão implementadas em seguida.</p>
        </div>
      </section>
    </main>
  );
}
