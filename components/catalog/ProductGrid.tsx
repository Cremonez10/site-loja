"use client";

import ProductCard from "./ProductCard";

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

type ProductGridProps = {
  products: Product[];
};

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
