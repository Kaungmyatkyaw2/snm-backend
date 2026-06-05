import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

const wishlistProductSelect = {
  id: true,
  name: true,
  slug: true,
  status: true,
  thumbnailUrl: true,
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
    orderBy: { price: 'asc' as const },
    take: 1,
  },
} as const;

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyWishlist(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        product: {
          select: wishlistProductSelect,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWishlistCount(userId: string) {
    const count = await this.prisma.wishlistItem.count({
      where: { userId },
    });

    return { count };
  }

  async addToWishlist(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return this.prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      create: {
        userId,
        productId,
      },
      update: {},
      select: {
        id: true,
        productId: true,
      },
    });
  }

  async removeFromWishlist(userId: string, productId: string) {
    await this.prisma.wishlistItem.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    return { productId };
  }

  async isWishlisted(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      select: { id: true },
    });

    return { wishlisted: !!item };
  }
}
