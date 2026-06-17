"use client";
import React, { useEffect, useState } from 'react';

const COOKIE_NAME = 'age_confirmed';

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; path=/; expires=${expires}; SameSite=Lax`;
}

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('age_confirmed');
      if (stored === 'true') return setAccepted(true);
      // check cookie
      const match = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE_NAME + '='));
      if (match) return setAccepted(true);
      setAccepted(false);
    } catch (err) {
      setAccepted(false);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem('age_confirmed', 'true');
      setCookie(COOKIE_NAME, '1', 30);
    } catch (err) {
      // ignore
    }
    setAccepted(true);
  };

  const deny = () => {
    setAccepted(false);
  };

  if (accepted === null) return null;

  if (!accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
        <div className="max-w-lg rounded-2xl bg-slate-900 p-6 text-center">
          <h2 className="text-2xl font-semibold">Este site é destinado a maiores de 18 anos.</h2>
          <p className="mt-3 text-slate-300">Confirme sua idade para continuar.</p>
          <div className="mt-6 flex justify-center gap-4">
            <button onClick={accept} className="rounded bg-green-600 px-4 py-2 text-white">Tenho 18 anos ou mais</button>
            <button onClick={deny} className="rounded border border-slate-700 px-4 py-2 text-slate-200">Sair</button>
          </div>
          {!accepted && (
            <p className="mt-4 text-slate-400">Não podemos exibir este conteúdo sem a confirmação de idade.</p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
