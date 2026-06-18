import type { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { serializeCategory, serializeProduct } from './serializers';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;
const DEFAULT_PAGE = 1;

export type PublicProductQueryParams = {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
};

type PublicProductWhereInput = Prisma.ProductWhereInput;

export async function getPublicCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
    },
  });

  return categories.map(serializeCategory);
}

export async function getPublicProducts(params: PublicProductQueryParams = {}) {
  const limit = Math.min(MAX_LIMIT, Math.max(1, params.limit ?? DEFAULT_LIMIT));
  const page = Math.max(DEFAULT_PAGE, params.page ?? DEFAULT_PAGE);

  const where: PublicProductWhereInput = {
    internal: false,
    status: { in: ['ACTIVE', 'OUT_OF_STOCK'] },
  };

  if (params.search && params.search.trim().length > 0) {
    where.OR = [
      { name: { contains: params.search.trim(), mode: 'insensitive' } },
      { description: { contains: params.search.trim(), mode: 'insensitive' } },
    ];
  }

  if (params.category && params.category.trim().length > 0) {
    where.categories = {
      some: {
        category: {
          slug: params.category.trim(),
        },
      },
    };
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            url: true,
            altText: true,
            position: true,
          },
        },
        attributes: {
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    items: products.map(serializeProduct),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getPublicProductBySlug(slug: string) {
  if (!slug || slug.trim().length === 0) {
    return null;
  }

  const product = await prisma.product.findFirst({
    where: {
      slug: slug.trim(),
      internal: false,
      status: { in: ['ACTIVE', 'OUT_OF_STOCK'] },
    },
    include: {
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          url: true,
          altText: true,
          position: true,
        },
      },
      attributes: {
        select: {
          id: true,
          name: true,
          value: true,
        },
      },
      categories: {
        select: {
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return product ? serializeProduct(product) : null;
}
