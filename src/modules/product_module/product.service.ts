import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts(query: ProductQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;
    const variantFilter: Prisma.ProductVariantWhereInput = {
      isActive: true,
      ...(query.in_stock ? { stockQuantity: { gt: 0 } } : {}),
      ...(query.min_price !== undefined || query.max_price !== undefined
        ? {
            price: {
              ...(query.min_price !== undefined ? { gte: query.min_price } : {}),
              ...(query.max_price !== undefined ? { lte: query.max_price } : {}),
            },
          }
        : {}),
    };

    const normalizedSortBy =
      query.sort_by ||
      (query.sort === 'price-low' || query.sort === 'price-high'
        ? 'price'
        : 'createdAt');
    const normalizedSortDir =
      query.sort_dir ||
      (query.sort === 'price-low'
        ? 'asc'
        : query.sort === 'price-high'
          ? 'desc'
          : 'desc');
    const isPriceSort = normalizedSortBy === 'price';

    const where: Prisma.ProductWhereInput = {
      status: 'active',
      ...(query.search
        ? {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(query.category_slug
        ? {
            category: {
              slug: query.category_slug,
            },
          }
        : {}),
      ...(query.shipping_type ? { shippingTypeKey: query.shipping_type } : {}),
      ...(query.brand_slugs?.length
        ? {
            brand: {
              slug: {
                in: query.brand_slugs,
              },
            },
          }
        : {}),
      ...(query.in_stock || query.min_price !== undefined || query.max_price !== undefined
        ? {
            variants: {
              some: variantFilter,
            },
          }
        : {}),
    };

    const [rawProducts, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: isPriceSort ? [{ createdAt: 'desc' }] : [{ [normalizedSortBy]: normalizedSortDir }],
        skip: isPriceSort ? 0 : skip,
        take: isPriceSort ? undefined : limit,
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnailUrl: true,
          shippingTypeKey: true,
          tags: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              sku: true,
              price: true,
              stockQuantity: true,
            },
            orderBy: { price: 'asc' },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const products = rawProducts.map((product) => ({
      ...product,
      shippingType: product.shippingTypeKey,
      variants: product.variants.map((variant) => ({
        ...variant,
        price: Number(variant.price),
      })),
    }));

    if (isPriceSort) {
      products.sort((left, right) => {
        const leftMin = left.variants[0]?.price ?? 0;
        const rightMin = right.variants[0]?.price ?? 0;

        return normalizedSortDir === 'asc'
          ? leftMin - rightMin
          : rightMin - leftMin;
      });

      return {
        data: products.slice(skip, skip + limit),
        total,
      };
    }

    return { data: products, total };
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        thumbnailUrl: true,
        shippingTypeKey: true,
        tags: true,
        status: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            sku: true,
            price: true,
            stockQuantity: true,
            weightValue: true,
            weightUnit: true,
          },
          orderBy: { price: 'asc' },
        },
        images: {
          select: {
            imageUrl: true,
            isPrimary: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...product,
      shippingType: product.shippingTypeKey,
      variants: product.variants.map((variant) => ({
        ...variant,
        price: Number(variant.price),
        weightValue: variant.weightValue ? Number(variant.weightValue) : null,
      })),
    };
  }
}
