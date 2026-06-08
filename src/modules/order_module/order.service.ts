import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { OrderQueryDto } from './dto/order-query.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyOrders(userId: string, query: OrderQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortDir = query.sortDir ?? 'desc';
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: sortDir },
        skip,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          total: true,
          paymentMethod: true,
          paymentStatus: true,
          deliveryDate: true,
          status: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              productName: true,
              thumbnailUrl: true,
              quantity: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMyOrderById(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: true,
        statusHistory: {
          orderBy: { changedAt: 'asc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
