"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLogoutButton from "../../../components/admin/AdminLogoutButton";

// ── Types ──────────────────────────────────────────────

type DraftItem = {
  id: string;
  productName: string;
  quantity: number;
  priceSnapshot: string;
};

type Draft = {
  id: string;
  status: string;
  createdAt: string;
  items: DraftItem[];
};

// ── Helpers ────────────────────────────────────────────

function formatBRL(value: string): string {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    INTENT_CREATED: "Interesse recebido",
    SENT_TO_WHATSAPP: "Enviado",
    COPIED_TO_CLIPBOARD: "Copiado",
  };
  return labels[status] ?? status;
}

// ── Sub-components ─────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const styles: Record<string, string> = {
    INTENT_CREATED: `${base} bg-amber-500/10 text-amber-400 border border-amber-500/30`,
    SENT_TO_WHATSAPP: `${base} bg-emerald-500/10 text-emerald-400 border border-emerald-500/30`,
    COPIED_TO_CLIPBOARD: `${base} bg-slate-700/60 text-slate-400 border border-slate-600/40`,
  };
  return (
    <span className={styles[status] ?? `${base} bg-slate-700 text-slate-300`}>
      {statusLabel(status)}
    </span>
  );
}

function EmptyState() {
  return (
    <div
      id="admin-interests-empty"
      className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 py-20 text-center"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/60 text-slate-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-400">
        Nenhum interesse registrado ainda.
      </p>
      <p className="mt-1 text-xs text-slate-600">
        Os registros aparecerão aqui quando clientes demonstrarem interesse.
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      id="admin-interests-error"
      className="flex flex-col items-center justify-center rounded-xl border border-rose-900/40 bg-rose-950/20 py-16 text-center"
    >
      <p className="text-sm font-medium text-rose-400">
        Não foi possível carregar os registros.
      </p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
      >
        Tentar novamente
      </button>
    </div>
  );
}

// ── Main page component ────────────────────────────────

export default function AdminInterestsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  const fetchDrafts = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/interests");
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const data = await res.json();
      setDrafts(data.drafts ?? []);
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      <section className="mx-auto max-w-screen-lg space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1">
              <Link
                href="/admin"
                className="text-xs text-slate-500 transition-colors hover:text-slate-300"
                id="admin-interests-back"
              >
                ← Painel
              </Link>
            </div>
            <h1
              id="admin-interests-heading"
              className="text-2xl font-semibold tracking-tight"
            >
              Interesses registrados
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Manifestações de interesse recebidas pelo catálogo.
            </p>
          </div>
          <div className="shrink-0">
            <AdminLogoutButton />
          </div>
        </div>

        {/* Body */}
        {status === "loading" && (
          <div
            id="admin-interests-loading"
            className="flex items-center justify-center py-20"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-amber-500" />
          </div>
        )}

        {status === "error" && <ErrorState onRetry={fetchDrafts} />}

        {status === "ok" && drafts.length === 0 && <EmptyState />}

        {status === "ok" && drafts.length > 0 && (
          <>
            {/* Summary bar — computed from already-fetched data only */}
            <div
              id="admin-interests-summary"
              className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-xs text-slate-400"
            >
              <span>
                <span className="font-semibold text-slate-200">
                  {drafts.length}
                </span>{" "}
                {drafts.length === 1
                  ? "interesse registrado"
                  : "interesses registrados"}
              </span>
              {(() => {
                const totalItems = drafts.reduce(
                  (acc, d) => acc + d.items.length,
                  0,
                );
                return totalItems !== drafts.length ? (
                  <>
                    <span className="text-slate-600">·</span>
                    <span>
                      <span className="font-semibold text-slate-200">
                        {totalItems}
                      </span>{" "}
                      {totalItems === 1 ? "item" : "itens"} no total
                    </span>
                  </>
                ) : null;
              })()}
            </div>

            {/*
             * Unified container: both the mobile card list and the desktop
             * table live inside #admin-interests-table so the existing test
             * selector keeps working regardless of viewport.
             */}
            <div id="admin-interests-table">
              {/* ── Mobile card list (hidden at >= sm) ── */}
              <ul
                className="space-y-4 sm:hidden"
                aria-label="Lista de interesses"
              >
                {drafts.map((draft) => (
                  <li
                    key={draft.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/30 p-4"
                  >
                    {/* Draft header */}
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">
                        #{shortId(draft.id)}
                      </span>
                      <StatusBadge status={draft.status} />
                      <span className="ml-auto text-xs text-slate-500">
                        {formatDateTime(draft.createdAt)}
                      </span>
                    </div>

                    {/* Item rows */}
                    <ul className="space-y-2">
                      {draft.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-start justify-between gap-2 rounded-lg border border-slate-800/60 bg-slate-900/20 px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-slate-200">
                              {item.productName}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Qtd.{" "}
                              <span className="font-medium text-slate-400">
                                {item.quantity}
                              </span>
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-medium text-amber-400">
                            {formatBRL(item.priceSnapshot)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>

              {/* ── Desktop table (hidden below sm, horizontal scroll) ── */}
              <div className="hidden overflow-hidden rounded-xl border border-slate-800 sm:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Ref.
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Data
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Situação
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Produto
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Qtd.
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Valor snapshot
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {drafts.map((draft) =>
                        draft.items.map((item, idx) => (
                          <tr
                            key={item.id}
                            className={`transition-colors hover:bg-slate-900/60 ${
                              idx === 0 ? "bg-slate-900/20" : "bg-slate-900/10"
                            }`}
                          >
                            {/*
                             * Ref, Date and Status are repeated on every row
                             * but hidden via `invisible` on non-first rows.
                             * This avoids rowSpan rendering bugs on tables
                             * inside overflow-x-auto containers.
                             */}
                            <td
                              className={`px-4 py-3 font-mono text-xs text-slate-500 ${
                                idx === 0 ? "" : "invisible select-none"
                              }`}
                            >
                              #{shortId(draft.id)}
                            </td>
                            <td
                              className={`px-4 py-3 text-xs text-slate-400 ${
                                idx === 0 ? "" : "invisible select-none"
                              }`}
                            >
                              {formatDateTime(draft.createdAt)}
                            </td>
                            <td
                              className={`px-4 py-3 ${
                                idx === 0 ? "" : "invisible select-none"
                              }`}
                            >
                              <StatusBadge status={draft.status} />
                            </td>
                            <td className="px-4 py-3 text-slate-200">
                              {item.productName}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-400">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-amber-400">
                              {formatBRL(item.priceSnapshot)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
