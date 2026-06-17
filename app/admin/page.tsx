import AdminLogoutButton from '../../components/admin/AdminLogoutButton';

export default function AdminHomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      <section className="mx-auto max-w-screen-md space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Painel administrativo</h1>
          <AdminLogoutButton />
        </div>
        <p className="text-slate-300">Área protegida para gestão futura do catálogo.</p>
      </section>
    </main>
  );
}
