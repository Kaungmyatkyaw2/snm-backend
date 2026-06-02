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
      ...(query.category_id ? { categoryId: query.category_id } : {}),
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
      ...(query.min_price !== undefined || query.max_price !== undefined
        ? {
            variants: {
              some: {
                isActive: true,
                price: {
                  ...(query.min_price !== undefined ? { gte: query.min_price } : {}),
                  ...(query.max_price !== undefined ? { lte: query.max_price } : {}),
                },
              },
            },
          }
        : {}),
    };

    const [rawProducts, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: query.sort === 'price-low' || query.sort === 'price-high' ? 0 : skip,
        take: query.sort === 'price-low' || query.sort === 'price-high' ? undefined : limit,
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

    if (query.sort === 'price-low' || query.sort === 'price-high') {
      products.sort((left, right) => {
        const leftMin = left.variants[0]?.price ?? 0;
        const rightMin = right.variants[0]?.price ?? 0;

        return query.sort === 'price-low' ? leftMin - rightMin : rightMin - leftMin;
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
