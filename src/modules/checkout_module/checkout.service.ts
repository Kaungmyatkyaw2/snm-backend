import { BadRequestException, Injectable } from '@nestjs/common';
import { buildCheckoutShippingQuote } from 'src/common/helpers/checkout-shipping.helper';
import { PrismaService } from 'src/database/prisma.service';
import { CartService } from '../cart_module/cart.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {}

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

  private calculateEarnedPoints(totalAmount: number, pointsPerAmount: number) {
    if (pointsPerAmount <= 0) {
      return 0;
    }

    return Math.floor(Math.max(0, totalAmount) / pointsPerAmount);
  }

  private formatDeliveryAddress(address: {
    postalCode: string;
    prefecture?: string | null;
    city: string;
    addressLine1: string;
    addressLine2?: string | null;
  }) {
    return [
      `〒${address.postalCode}`,
      address.prefecture,
      address.city,
      address.addressLine1,
      address.addressLine2,
    ]
      .filter(Boolean)
      .join(', ');
  }

  private async buildShippingQuoteForUser(userId: string, addressId: string) {
    const [
      address,
      cart,
      shippingTypes,
      feeRules,
      settings,
      zones,
      loyaltySettings,
    ] = await Promise.all([
      this.prisma.userAddress.findFirst({
        where: { id: addressId, userId },
        select: {
          id: true,
          postalCode: true,
          prefecture: true,
          city: true,
          addressLine1: true,
          addressLine2: true,
        },
      }),
      this.prisma.cart.findUnique({
        where: { userId },
        select: {
          items: {
            select: {
              quantity: true,
              variant: {
                select: {
                  price: true,
                  isActive: true,
                  product: {
                    select: {
                      status: true,
                      shippingTypeKey: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.shippingType.findMany({
        where: { status: 'active' },
        select: { key: true, name: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.shippingFeeRule.findMany({
        select: {
          shippingTypeKey: true,
          zoneId: true,
          baseFee: true,
        },
      }),
      this.prisma.shippingSettings.findFirst({
        where: { scope: 'default' },
        select: {
          freeShippingEnabled: true,
          freeShippingThreshold: true,
        },
      }),
      this.prisma.shippingZone.findMany({
        select: {
          id: true,
          name: true,
          deliveryDays: true,
          locations: true,
          surcharge: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.loyaltySettings.findFirst({
        select: {
          pointsPerAmount: true,
        },
      }),
    ]);

    if (!address) {
      throw new BadRequestException('Selected address is invalid');
    }

    if (!cart?.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    const validItems = cart.items.filter(
      (item) =>
        item.variant.isActive && item.variant.product.status === 'active',
    );

    if (!validItems.length) {
      throw new BadRequestException('No shippable cart items found');
    }

    const subtotal = validItems.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity,
      0,
    );

    const quote = buildCheckoutShippingQuote({
      address,
      subtotal,
      shippingTypeKeys: validItems.map(
        (item) => item.variant.product.shippingTypeKey,
      ),
      shippingTypes,
      feeRules: feeRules.map((rule) => ({
        shippingTypeKey: rule.shippingTypeKey,
        zoneId: rule.zoneId,
        baseFee: Number(rule.baseFee),
      })),
      settings: settings
        ? {
            freeShippingEnabled: settings.freeShippingEnabled,
            freeShippingThreshold: Number(settings.freeShippingThreshold),
          }
        : null,
      zones: zones.map((zone) => ({
        id: zone.id,
        name: zone.name,
        deliveryDays: zone.deliveryDays,
        locations: zone.locations,
        surcharge: Number(zone.surcharge),
      })),
    });

    return {
      ...quote,
      pointsToEarn: this.calculateEarnedPoints(
        subtotal,
        loyaltySettings?.pointsPerAmount ?? 100,
      ),
    };
  }

  async getCheckoutMeta(userId: string) {
    const [user, addresses, bankAccounts, cart] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      }),
      this.prisma.userAddress.findMany({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          label: true,
          firstName: true,
          lastName: true,
          phone: true,
          postalCode: true,
          prefecture: true,
          city: true,
          addressLine1: true,
          addressLine2: true,
          isDefault: true,
        },
      }),
      this.prisma.bankPaymentAccount.findMany({
        where: { status: 'active' },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          bankName: true,
          bankLogoUrl: true,
          accountHolder: true,
          accountNumber: true,
          accountType: true,
          branchName: true,
          branchCode: true,
          notes: true,
          isPrimary: true,
        },
      }),
      this.cartService.getCart(userId),
    ]);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const defaultAddress =
      addresses.find((address) => address.isDefault) ?? null;

    return {
      customer: user,
      addresses,
      defaultAddress,
      bankAccounts,
      cart,
    };
  }

  async getShippingQuote(userId: string, addressId: string) {
    return this.buildShippingQuoteForUser(userId, addressId);
  }

  async createCheckout(userId: string, payload: CreateCheckoutDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const [cart, shippingQuote, address, loyaltySettings] = await Promise.all([
      this.prisma.cart.findUnique({
        where: { userId },
        select: {
          id: true,
          items: {
            select: {
              id: true,
              quantity: true,
              productId: true,
              variantId: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  thumbnailUrl: true,
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
                  costPerUnit: true,
                },
              },
            },
          },
        },
      }),
      this.buildShippingQuoteForUser(userId, payload.addressId),
      this.prisma.userAddress.findFirst({
        where: { id: payload.addressId, userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          postalCode: true,
          prefecture: true,
          city: true,
          addressLine1: true,
          addressLine2: true,
        },
      }),
      this.prisma.loyaltySettings.findFirst({
        select: {
          pointsPerAmount: true,
          pointValue: true,
        },
      }),
    ]);

    if (!cart?.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    if (!address) {
      throw new BadRequestException('Selected address is invalid');
    }

    if (
      payload.paymentMethod === 'bank_transfer' &&
      !payload.bankPaymentAccountId
    ) {
      throw new BadRequestException(
        'Bank account is required for bank transfer',
      );
    }

    if (
      payload.paymentMethod === 'bank_transfer' &&
      !payload.transferProofUrl
    ) {
      throw new BadRequestException(
        'Transfer proof is required for bank transfer',
      );
    }

    const bankAccount = payload.bankPaymentAccountId
      ? await this.prisma.bankPaymentAccount.findFirst({
          where: {
            id: payload.bankPaymentAccountId,
            status: 'active',
          },
          select: {
            id: true,
            bankName: true,
          },
        })
      : null;

    if (payload.paymentMethod === 'bank_transfer' && !bankAccount) {
      throw new BadRequestException('Selected bank account is invalid');
    }

    for (const item of cart.items) {
      if (item.variant.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `${item.product.name} does not have enough stock`,
        );
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity,
      0,
    );
    const firstAvailableDeliveryDate = shippingQuote.deliveryOptions[0]?.value;

    if (
      !firstAvailableDeliveryDate ||
      payload.deliveryDate !== firstAvailableDeliveryDate
    ) {
      throw new BadRequestException(
        'Delivery date must match the first available date for this address',
      );
    }

    const shippingFee = shippingQuote.totalFee;
    const pointValue = Number(loyaltySettings?.pointValue ?? 1);
    const rawPointsDiscount = (payload.pointsUsed ?? 0) * pointValue;
    const pointsDiscount = Math.min(rawPointsDiscount, subtotal + shippingFee);
    const total = subtotal + shippingFee - pointsDiscount;
    const pointsEarned = this.calculateEarnedPoints(
      subtotal - pointsDiscount,
      loyaltySettings?.pointsPerAmount ?? 100,
    );
    const deliveryAddress = this.formatDeliveryAddress(address);

    const order = await this.prisma.$transaction(async (tx) => {
      const orderCount = await tx.order.count();
      const year = new Date().getFullYear();
      const orderNumber = `SNM-${year}-${String(orderCount + 1).padStart(4, '0')}`;

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName: `${address.firstName} ${address.lastName}`.trim(),
          customerEmail: payload.customerEmail?.trim() || user.email,
          customerPhone: payload.customerPhone?.trim() || address.phone,
          deliveryAddress,
          postalCode: address.postalCode,
          prefecture: address.prefecture,
          city: address.city,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          subtotal,
          shippingFee,
          pointsDiscount,
          total,
          pointsEarned,
          pointsUsed: payload.pointsUsed ?? 0,
          deliveryDate: new Date(payload.deliveryDate),
          deliveryTimeSlot: payload.deliveryTimeSlot,
          paymentMethod: payload.paymentMethod,
          paymentStatus: 'pending',
          customerBankChoice: bankAccount?.bankName ?? null,
          bankPaymentAccountId: bankAccount?.id ?? null,
          transferProofUrl: payload.transferProofUrl ?? null,
          checkoutShippingMethod: shippingQuote.checkoutShippingMethod,
          customerNote: payload.customerNote,
          items: {
            create: cart.items.map((item) => {
              const unitPrice = Number(item.variant.price);
              const lineTotal = unitPrice * item.quantity;
              const weightValue = item.variant.weightValue
                ? Number(item.variant.weightValue)
                : null;

              return {
                productId: item.productId,
                variantId: item.variantId,
                productName: item.product.name,
                variantLabel: this.formatVariantLabel({
                  sku: item.variant.sku,
                  weightValue,
                  weightUnit: item.variant.weightUnit,
                }),
                sku: item.variant.sku,
                quantity: item.quantity,
                costPerUnit: item.variant.costPerUnit
                  ? Number(item.variant.costPerUnit)
                  : 0,
                unitPrice,
                lineTotal,
                thumbnailUrl: item.product.thumbnailUrl,
              };
            }),
          },
          statusHistory: {
            create: {
              status: 'pending',
              changedById: userId,
              changedByLabel: 'customer',
            },
          },
        },
        select: {
          id: true,
          userId: true,
          customerName: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
        },
      });

      await tx.adminNotification.create({
        data: {
          type: 'order',
          title: 'New Order Received',
          message: `Order ${createdOrder.orderNumber} was placed by ${createdOrder.customerName}.`,
          orderId: createdOrder.id,
          userId: createdOrder.userId,
        },
      });

      await tx.financialTransaction.createMany({
        data: [
          {
            orderId: createdOrder.id,
            orderNumber: createdOrder.orderNumber,
            type: 'order_payment',
            amount: subtotal,
            currency: 'jpy',
            description: `Order payment for ${createdOrder.orderNumber}`,
            createdById: userId,
          },
          ...(shippingFee > 0
            ? [
                {
                  orderId: createdOrder.id,
                  orderNumber: createdOrder.orderNumber,
                  type: 'shipping_fee' as const,
                  amount: shippingFee,
                  currency: 'jpy' as const,
                  description: `Shipping fee (${shippingQuote.checkoutShippingMethod})`,
                  createdById: userId,
                },
              ]
            : []),
          ...((payload.pointsUsed ?? 0) > 0
            ? [
                {
                  orderId: createdOrder.id,
                  orderNumber: createdOrder.orderNumber,
                  type: 'points_redeemed' as const,
                  amount: pointsDiscount,
                  currency: 'points' as const,
                  description: `${payload.pointsUsed} points redeemed`,
                  createdById: userId,
                },
              ]
            : []),
        ],
      });

      for (const item of cart.items) {
        const quantityBefore = item.variant.stockQuantity;
        const quantityAfter = quantityBefore - item.quantity;

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stockQuantity: quantityAfter,
          },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            changeType: 'sale',
            quantityChange: -item.quantity,
            quantityBefore,
            quantityAfter,
            note: `Order ${createdOrder.orderNumber}`,
            createdById: userId,
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return createdOrder;
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: Number(order.total),
      displayTotal: this.formatCurrency(Number(order.total)),
      pointsEarned: pointsEarned,
    };
  }
}
