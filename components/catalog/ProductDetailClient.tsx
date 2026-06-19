"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────

type ProductImage = {
  id: string;
  url: string;
  altText: string;
  position: number;
};

type ProductCategory = {
  id: string;
  slug: string;
  name: string;
};

type ProductAttribute = {
  id: string;
  name: string;
  value: string;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: string;
  priceCents: number;
  status: string;
  brand: { id: string; name: string; slug: string } | null;
  images: ProductImage[];
  categories: ProductCategory[];
  attributes: ProductAttribute[];
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

// ── Formatters ─────────────────────────────────────────

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// ── Sub-components ─────────────────────────────────────

function BackLink({ id = "pdp-back-link" }: { id?: string }) {
  return (
    <Link
      href="/"
      id={id}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-300 transition-all duration-200 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-100"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
      Voltar ao catálogo
    </Link>
  );
}

function ImagePlaceholder({ name }: { name: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-600"
      aria-label={`Imagem indisponível para ${name}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1}
        stroke="currentColor"
        className="h-16 w-16"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
        />
      </svg>
    </div>
  );
}

// ── Loading state ──────────────────────────────────────

function ProductLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-amber-500" />
      <p className="text-sm text-slate-400">Carregando produto...</p>
    </div>
  );
}

// ── Error / empty states ───────────────────────────────

type InfoStateProps = {
  heading: string;
  message: string;
  onRetry?: () => void;
};

function InfoState({ heading, message, onRetry }: InfoStateProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-screen-xl px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                JoFogo
              </span>
            </span>
            <BackLink id="pdp-header-back-link" />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/60 text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-200">{heading}</h2>
        <p className="mt-2 text-sm text-slate-400">{message}</p>
        {onRetry && (
          <button
            id="pdp-retry-btn"
            onClick={onRetry}
            className="mt-5 rounded-lg border border-slate-700 px-5 py-2 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800/60 hover:text-slate-100"
          >
            Tentar novamente
          </button>
        )}
        <div className="mt-5">
          <BackLink />
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────

export default function ProductDetailClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorKind, setErrorKind] = useState<
    "none" | "forbidden" | "not_found" | "generic"
  >("none");

  const analyticsTracked = useRef(false);

  const fetchProduct = async () => {
    setLoading(true);
    setErrorKind("none");
    setProduct(null);
    analyticsTracked.current = false;

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}`);

      if (res.status === 403) {
        setErrorKind("forbidden");
        return;
      }
      if (res.status === 404) {
        setErrorKind("not_found");
        return;
      }
      if (!res.ok) {
        setErrorKind("generic");
        return;
      }

      const data: Product = await res.json();
      setProduct(data);
    } catch {
      setErrorKind("generic");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Fire analytics once after valid product loads
  useEffect(() => {
    if (product && !analyticsTracked.current) {
      analyticsTracked.current = true;
      trackEvent("product_viewed", {
        productId: product.id,
        slug: product.slug,
        status: product.status,
      });
    }
  }, [product]);

  // ── States ──

  if (loading) return <ProductLoading />;

  if (errorKind === "forbidden") {
    return (
      <InfoState
        heading="Acesso restrito"
        message="Confirmação de idade necessária para visualizar este produto."
      />
    );
  }

  if (errorKind === "not_found") {
    return (
      <InfoState
        heading="Produto não encontrado"
        message="O item que você procura não está disponível no catálogo."
      />
    );
  }

  if (errorKind === "generic") {
    return (
      <InfoState
        heading="Não foi possível carregar"
        message="Ocorreu um problema ao carregar o produto. Tente novamente."
        onRetry={fetchProduct}
      />
    );
  }

  if (!product) return null;

  const primaryImage = product.images[0] ?? null;
  const isOutOfStock = product.status === "OUT_OF_STOCK";
  const priceNumber = Number(product.price);
  const formattedPrice = Number.isFinite(priceNumber) ? formatBRL(priceNumber) : "—";

  // ── Loaded product UI ──

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-screen-xl px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                JoFogo
              </span>
            </span>
            <span className="text-xs text-slate-500">Catálogo discreto</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-4 py-6" id="pdp-main">
        {/* Breadcrumb / back */}
        <div className="mb-5">
          <BackLink />
        </div>

        <article
          className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/80 shadow-lg shadow-slate-950/40"
          aria-label={`Detalhes de ${product.name}`}
        >
          <div className="md:flex">
            {/* Image */}
            <div className="relative aspect-square w-full overflow-hidden md:aspect-auto md:h-auto md:w-2/5">
              {primaryImage ? (
                <img
                  src={primaryImage.url}
                  alt={primaryImage.altText || product.name}
                  className="h-full w-full object-cover"
                  id="pdp-product-image"
                />
              ) : (
                <div className="aspect-square w-full" id="pdp-product-image-placeholder">
                  <ImagePlaceholder name={product.name} />
                </div>
              )}

              {/* Out of stock badge */}
              {isOutOfStock && (
                <div className="absolute left-3 top-3">
                  <span
                    id="pdp-out-of-stock-badge"
                    className="inline-flex items-center rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-amber-400 backdrop-blur-sm"
                  >
                    Indisponível no momento
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5 md:p-8">
              {/* Categories */}
              {product.categories.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1" id="pdp-categories">
                  {product.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="text-[11px] font-medium uppercase tracking-wider text-slate-500"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Name */}
              <h1
                id="pdp-product-name"
                className="text-xl font-bold leading-snug text-slate-100 sm:text-2xl"
              >
                {product.name}
              </h1>

              {/* Brand */}
              {product.brand && (
                <p id="pdp-brand" className="mt-1 text-sm text-slate-500">
                  {product.brand.name}
                </p>
              )}

              {/* Price */}
              <p
                id="pdp-price"
                className={`mt-4 text-2xl font-bold ${
                  isOutOfStock ? "text-slate-500 line-through" : "text-amber-400"
                }`}
              >
                {formattedPrice}
              </p>

              {/* Out of stock label (text version) */}
              {isOutOfStock && (
                <p className="mt-1 text-sm text-amber-500/80">
                  Indisponível no momento
                </p>
              )}

              {/* Description */}
              {product.description && (
                <div className="mt-5 border-t border-slate-800/60 pt-5">
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Descrição
                  </h2>
                  <p
                    id="pdp-description"
                    className="text-sm leading-relaxed text-slate-300"
                  >
                    {product.description}
                  </p>
                </div>
              )}

              {/* Attributes */}
              {product.attributes.length > 0 && (
                <div className="mt-5 border-t border-slate-800/60 pt-5">
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Características
                  </h2>
                  <dl
                    id="pdp-attributes"
                    className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3"
                  >
                    {product.attributes.map((attr) => (
                      <div key={attr.id}>
                        <dt className="text-xs text-slate-500">{attr.name}</dt>
                        <dd className="text-sm font-medium text-slate-300">{attr.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Back to catalog CTA */}
              <div className="mt-8 border-t border-slate-800/60 pt-5">
                <Link
                  href="/"
                  id="pdp-back-to-catalog"
                  className="flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-100"
                >
                  ← Voltar ao catálogo
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800/40 py-6 text-center text-xs text-slate-600">
        <p>JoFogo — Catálogo discreto</p>
      </footer>
    </div>
  );
}
