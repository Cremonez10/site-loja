"use client";
import React from 'react';

export default function AdminLogoutButton() {
  const handle = async () => {
    await fetch('/api/admin/auth/signout', { method: 'POST' });
    window.location.href = '/admin/signin';
  };

  return (
    <button
      onClick={handle}
      className="rounded bg-slate-800 px-3 py-2 text-sm text-slate-100 hover:opacity-90"
    >
      Sair
    </button>
  );
}
