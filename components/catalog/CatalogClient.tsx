"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CategoryFilter from "./CategoryFilter";
import ProductSearch from "./ProductSearch";
import ProductGrid from "./ProductGrid";
import { CatalogLoading, CatalogError, CatalogEmpty } from "./CatalogStates";

// ── Types ──────────────────────────────────────────────

type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
};

type ProductImage = {
  url: string;
  alt?: string | null;
  position?: number;
};

type ProductCategory = {
  id?: string;
  slug: string;
  name: string;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  price: string;
  priceCents: number;
  status: string;
  brand?: { name: string; slug?: string } | null;
  categories?: ProductCategory[];
  images?: ProductImage[];
  attributes?: Array<{ name: string; value: string }>;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ProductsResponse = {
  items: Product[];
  pagination: Pagination;
};

// ── Analytics helper ───────────────────────────────────

async function trackEvent(
  name: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, metadata }),
    });
  } catch {
    // Analytics failures must never break the UI
  }
}

// ── Component ──────────────────────────────────────────

const LIMIT = 12;

export default function CatalogClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if initial load has completed to avoid analytics on mount
  const initialLoadDone = useRef(false);
  // Track previous category to detect user-driven changes
  const prevCategory = useRef<string | null>(null);

  // ── Fetch categories (once on mount) ──

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to load categories");
        const data: Category[] = await res.json();
        if (!cancelled) setCategories(data);
      } catch {
        // Categories failing is non-critical; filters just won't show
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Fetch products ──

  const fetchProducts = useCallback(
    async (opts: {
      category: string | null;
      search: string;
      page: number;
      append: boolean;
    }) => {
      if (opts.append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams();
        if (opts.category) params.set("category", opts.category);
        if (opts.search) params.set("search", opts.search);
        params.set("page", String(opts.page));
        params.set("limit", String(LIMIT));

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load products");

        const data: ProductsResponse = await res.json();

        if (opts.append) {
          setProducts((prev: Product[]) => [...prev, ...data.items]);
        } else {
          setProducts(data.items);
        }
        setPagination(data.pagination);

        // Analytics: catalog_viewed after products load successfully
        trackEvent("catalog_viewed", {
          category: opts.category ?? "all",
          resultsCount: data.pagination.total,
        });
      } catch {
        setError("Não foi possível carregar o catálogo agora.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // ── Initial load + refetch on filter/search changes ──

  useEffect(() => {
    // On category or search change, reset to page 1 and replace items
    setPage(1);
    setProducts([]);
    fetchProducts({
      category: selectedCategory,
      search: appliedSearchQuery,
      page: 1,
      append: false,
    });

    // Analytics: category_viewed when category changes (not on initial mount)
    if (initialLoadDone.current && prevCategory.current !== selectedCategory) {
      trackEvent("category_viewed", {
        categorySlug: selectedCategory ?? "all",
      });
    }

    prevCategory.current = selectedCategory;
    initialLoadDone.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, appliedSearchQuery]);

  // ── Handlers ──

  const handleSearch = (query: string) => {
    setAppliedSearchQuery(query);

    // Analytics: search_performed (no raw search text)
    if (query.length > 0) {
      trackEvent("search_performed", {
        hasQuery: true,
        queryLength: query.length,
      });
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts({
      category: selectedCategory,
      search: appliedSearchQuery,
      page: nextPage,
      append: true,
    });
  };

  const handleRetry = () => {
    fetchProducts({
      category: selectedCategory,
      search: appliedSearchQuery,
      page: 1,
      append: false,
    });
  };

  const hasMore = pagination ? page < pagination.totalPages : false;

  // ── Render ──

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-screen-xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                JoFogo
              </span>
            </h1>
            <span className="text-xs text-slate-500">Catálogo discreto</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-screen-xl px-4 py-8">
        {/* Catalog intro */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-slate-200">
            Catálogo discreto
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Explore itens selecionados com uma experiência simples e reservada.
          </p>
        </section>

        {/* Search */}
        <section className="mb-5" aria-label="Busca de produtos">
          <ProductSearch onSearch={handleSearch} initialQuery="" />
        </section>

        {/* Category filter */}
        {categories.length > 0 && (
          <section className="mb-6" aria-label="Filtro por categoria">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </section>
        )}

        {/* Divider between controls and results */}
        <div className="mb-6 border-t border-slate-800/50" />
        {loading && <CatalogLoading />}

        {!loading && error && <CatalogError onRetry={handleRetry} />}

        {!loading && !error && products.length === 0 && <CatalogEmpty />}

        {!loading && !error && products.length > 0 && (
          <>
            {/* Result count */}
            {pagination && (
              <p className="mb-4 text-xs text-slate-500">
                {pagination.total === 1
                  ? "1 item encontrado"
                  : `${pagination.total} itens encontrados`}
              </p>
            )}

            <ProductGrid products={products} />

            {/* Load more */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="rounded-xl border border-slate-700 bg-slate-800/50 px-8 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-100 disabled:cursor-wait disabled:opacity-60"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-amber-500" />
                      Carregando...
                    </span>
                  ) : (
                    "Carregar mais"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/40 py-8 text-center text-xs text-slate-600">
        <p>JoFogo — Catálogo discreto</p>
      </footer>
    </main>
  );
}
