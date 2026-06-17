"use client";
import React, { useState } from 'react';

export default function AdminSigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.href = '/admin';
        return;
      }
      setError('Credenciais inválidas.');
    } catch (err) {
      setError('Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      <section className="mx-auto max-w-screen-md">
        <h1 className="text-3xl font-semibold">Acesso administrativo</h1>
        <p className="text-slate-300">Entre para gerenciar o catálogo</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-200">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 w-full rounded bg-slate-800 px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-200">Senha</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="mt-1 w-full rounded bg-slate-800 px-3 py-2 text-slate-100"
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              Entrar
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
