import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PaymentTransactionQueryDto } from './dto/payment-transaction-query.dto';

const paymentTransactionSelect = {
  id: true,
  orderId: true,
  orderNumber: true,
  type: true,
  amount: true,
  currency: true,
  description: true,
  createdAt: true,
  order: {
    select: {
      id: true,
      orderNumber: true,
      paymentMethod: true,
      paymentStatus: true,
      createdAt: true,
    },
  },
} as const;

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyPaymentTransactions(
    userId: string,
    query: PaymentTransactionQueryDto,
  ) {
    const limit = query.limit ?? 20;
    const where = {
      order: {
        userId,
      },
    };

    const [items, orderPaymentSum, shippingFeeSum, discountSum] =
      await Promise.all([
        this.prisma.financialTransaction.findMany({
          where,
          select: paymentTransactionSelect,
          orderBy: { createdAt: 'desc' },
          take: limit + 1,
          ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
        }),
        this.prisma.financialTransaction.aggregate({
          where: { ...where, type: 'order_payment' },
          _sum: { amount: true },
        }),
        this.prisma.financialTransaction.aggregate({
          where: { ...where, type: 'shipping_fee' },
          _sum: { amount: true },
        }),
        this.prisma.financialTransaction.aggregate({
          where: { ...where, type: { in: ['discount', 'points_redeemed'] } },
          _sum: { amount: true },
        }),
      ]);

    let nextCursor: string | undefined;
    if (items.length > limit) {
      nextCursor = items.pop()?.id;
    }

    return {
      items,
      nextCursor,
      summary: {
        totalPaid: orderPaymentSum._sum.amount ?? 0,
        totalShipping: shippingFeeSum._sum.amount ?? 0,
        totalDiscount: discountSum._sum.amount ?? 0,
      },
    };
  }
}
