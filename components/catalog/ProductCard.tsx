"use client";

import Link from "next/link";

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
  images?: ProductImage[];
  categories?: ProductCategory[];
  attributes?: Array<{ name: string; value: string }>;
};

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images?.[0] ?? null;
  const isOutOfStock = product.status === "OUT_OF_STOCK";
  const priceNumber = Number(product.price);
  const formattedPrice = Number.isFinite(priceNumber)
    ? formatBRL(priceNumber)
    : "—";
  const productCategories = product.categories ?? [];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/80 shadow-lg shadow-slate-950/40 transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/50">
      {/* Image area */}
      <div className="relative aspect-square overflow-hidden bg-slate-800/40">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-850 text-slate-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="h-12 w-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
              />
            </svg>
          </div>
        )}

        {/* Out of stock badge */}
        {isOutOfStock && (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-amber-400 backdrop-blur-sm">
              Indisponível no momento
            </span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col p-4">
        {/* Categories */}
        {productCategories.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {productCategories.map((cat, index) => (
              <span
                key={cat.id ?? `cat-${index}`}
                className="text-[11px] font-medium uppercase tracking-wider text-slate-500"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Product name */}
        <h2 className="text-base font-semibold leading-snug text-slate-100 line-clamp-2">
          {product.name}
        </h2>

        {/* Brand */}
        {product.brand && (
          <p className="mt-0.5 text-xs text-slate-500">{product.brand.name}</p>
        )}

        {/* Spacer to push price and CTA to bottom */}
        <div className="mt-auto pt-3">
          {/* Price */}
          <p
            className={`text-lg font-bold ${
              isOutOfStock ? "text-slate-500 line-through" : "text-amber-400"
            }`}
          >
            {formattedPrice}
          </p>

          {/* CTA */}
          <Link
            href={`/products/${product.slug}`}
            className={`mt-3 flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
              isOutOfStock
                ? "border border-slate-700 bg-slate-800/40 text-slate-500 cursor-default"
                : "bg-amber-600 text-white hover:bg-amber-500 active:bg-amber-700 shadow-md shadow-amber-900/20 hover:shadow-lg hover:shadow-amber-900/30"
            }`}
            aria-disabled={isOutOfStock}
            tabIndex={isOutOfStock ? -1 : undefined}
            onClick={
              isOutOfStock
                ? (e: React.MouseEvent) => e.preventDefault()
                : undefined
            }
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
