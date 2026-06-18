"use client";

type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
};

type CategoryFilterProps = {
  categories: Category[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
};

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <nav
      aria-label="Filtro por categoria"
      className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
          selected === null
            ? "bg-amber-600 text-white shadow-md shadow-amber-900/30"
            : "border border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-100"
        }`}
      >
        Todos os itens
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
            selected === cat.slug
              ? "bg-amber-600 text-white shadow-md shadow-amber-900/30"
              : "border border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-100"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </nav>
  );
}
