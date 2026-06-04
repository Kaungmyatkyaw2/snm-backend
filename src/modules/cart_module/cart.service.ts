import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private formatCurrency(amount: number) {
    return `¥${amount.toLocaleString()}`;
  }

  private formatVariantLabel(variant: {
    sku: string;
    weightValue: number | null;
    weightUnit: string | null;
  }) {
    if (variant.weightValue && variant.weightUnit) {
      return `${variant.weightValue} ${variant.weightUnit}`;
    }

    return variant.sku;
  }

  private async ensureCart(userId: string) {
    const existingCart = await this.prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (existingCart) {
      return existingCart;
    }

    return this.prisma.cart.create({
      data: {
        userId,
      },
      select: { id: true },
    });
  }

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      select: {
        id: true,
        items: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnailUrl: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            variant: {
              select: {
                id: true,
                sku: true,
                price: true,
                stockQuantity: true,
                weightValue: true,
                weightUnit: true,
              },
            },
          },
        },
      },
    });

    const items =
      cart?.items.map((item) => {
        const unitPrice = Number(item.variant.price);
        const lineTotal = unitPrice * item.quantity;
        const weightValue = item.variant.weightValue
          ? Number(item.variant.weightValue)
          : null;

        return {
          id: item.id,
          quantity: item.quantity,
          lineTotal,
          displayLineTotal: this.formatCurrency(lineTotal),
          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            thumbnailUrl: item.product.thumbnailUrl,
            categoryName: item.product.category?.name ?? null,
          },
          variant: {
            id: item.variant.id,
            sku: item.variant.sku,
            price: unitPrice,
            displayPrice: this.formatCurrency(unitPrice),
            stockQuantity: item.variant.stockQuantity,
            weightValue,
            weightUnit: item.variant.weightUnit,
            label: this.formatVariantLabel({
              sku: item.variant.sku,
              weightValue,
              weightUnit: item.variant.weightUnit,
            }),
          },
        };
      }) ?? [];

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart?.id ?? null,
      itemCount: items.length,
      totalQuantity,
      subtotal,
      displaySubtotal: this.formatCurrency(subtotal),
      items,
    };
  }

  async addItem(userId: string, payload: AddCartItemDto) {
    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id: payload.variantId,
        productId: payload.productId,
        isActive: true,
      },
      select: {
        id: true,
        stockQuantity: true,
      },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    const cart = await this.ensureCart(userId);
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId: payload.variantId,
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    const nextQuantity = (existingItem?.quantity ?? 0) + (payload.quantity ?? 1);

    if (variant.stockQuantity < nextQuantity) {
      throw new BadRequestException('Not enough stock available');
    }

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: nextQuantity,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: payload.productId,
          variantId: payload.variantId,
          quantity: payload.quantity ?? 1,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, payload: UpdateCartItemDto) {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId,
        },
      },
      select: {
        id: true,
        variantId: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: cartItem.variantId },
      select: {
        stockQuantity: true,
      },
    });

    if (!variant || variant.stockQuantity < payload.quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    await this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: {
        quantity: payload.quantity,
      },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    return this.getCart(userId);
  }
}
