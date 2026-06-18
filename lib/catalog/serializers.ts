export function serializeCategory(category: {
  id: string;
  slug: string;
  name: string;
  description: string;
}) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
  };
}

import type { Product } from '@prisma/client';

type PublicSerializedProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: string;
  priceCents: number;
  status: Product['status'];
  brand: { id: string; name: string; slug: string } | null;
  images: Array<{ id: string; url: string; altText: string; position: number }>;
  categories: Array<{ id: string; slug: string; name: string }>;
  attributes: Array<{ id: string; name: string; value: string }>;
};

export function serializeProduct(product: {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: { toString(): string };
  status: Product['status'];
  brand: { id: string; name: string; slug: string } | null;
  images?: Array<{ id: string; url: string; altText: string; position: number }>;
  categories?: Array<{ category: { id: string; slug: string; name: string } }>;
  attributes?: Array<{ id: string; name: string; value: string }>;
}): PublicSerializedProduct {
  const priceString = product.price?.toString?.() ?? '0.00';
  const priceCents = Number(priceString) * 100;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: priceString,
    priceCents: Number.isFinite(priceCents) ? Math.round(priceCents) : 0,
    status: product.status,
    brand: product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          slug: product.brand.slug,
        }
      : null,
    images: (product.images ?? []).map((image) => ({
      id: image.id,
      url: image.url,
      altText: image.altText,
      position: image.position,
    })),
    categories: (product.categories ?? []).map((productCategory) => {
      const category = productCategory.category;
      return {
        id: category.id,
        slug: category.slug,
        name: category.name,
      };
    }),
    attributes: (product.attributes ?? []).map((attribute) => ({
      id: attribute.id,
      name: attribute.name,
      value: attribute.value,
    })),
  };
}
