"use client";

import { useState } from "react";

type ProductSearchProps = {
  onSearch: (query: string) => void;
  initialQuery?: string;
};

export default function ProductSearch({
  onSearch,
  initialQuery = "",
}: ProductSearchProps) {
  const [input, setInput] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(input.trim());
  };

  const handleClear = () => {
    setInput("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={80}
          placeholder="Buscar por nome ou descrição"
          className="w-full rounded-lg border border-slate-700 bg-slate-800/60 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600/50"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500 active:bg-amber-700"
      >
        Buscar
      </button>
      {input.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="shrink-0 rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800/60 hover:text-slate-200"
        >
          Limpar
        </button>
      )}
    </form>
  );
}
