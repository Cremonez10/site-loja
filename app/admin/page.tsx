import Link from 'next/link';
import AdminLogoutButton from '../../components/admin/AdminLogoutButton';

export default function AdminHomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      <section className="mx-auto max-w-screen-md space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Painel administrativo</h1>
          <AdminLogoutButton />
        </div>
        <p className="text-slate-400">Área protegida para gestão do catálogo.</p>

        {/* Navigation cards */}
        <nav aria-label="Seções do painel" className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/interests"
            id="admin-nav-interests"
            className="flex flex-col gap-1.5 rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-slate-700 hover:bg-slate-900"
          >
            <span className="text-sm font-semibold text-slate-100">
              Interesses registrados
            </span>
            <span className="text-xs text-slate-500">
              Manifestações de interesse recebidas pelo catálogo.
            </span>
          </Link>
        </nav>
      </section>
    </main>
  );
}
