import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { NotificationQueryDto } from './dto/notification-query.dto';

const userNotificationSelect = {
  id: true,
  eventType: true,
  title: true,
  message: true,
  read: true,
  orderId: true,
  createdAt: true,
} as const;

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyNotifications(userId: string, query: NotificationQueryDto) {
    const limit = query.limit ?? 20;

    const items = await this.prisma.userNotification.findMany({
      where: {
        userId,
        ...(query.unreadOnly ? { read: false } : {}),
      },
      select: userNotificationSelect,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (items.length > limit) {
      nextCursor = items.pop()?.id;
    }

    return { items, nextCursor };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.userNotification.count({
      where: { userId, read: false },
    });

    return { count };
  }

  async markRead(userId: string, id: string) {
    const result = await this.prisma.userNotification.updateMany({
      where: { id, userId },
      data: { read: true },
    });

    if (result.count === 0) {
      throw new BadRequestException('Notification not found');
    }

    return { success: true };
  }
}
