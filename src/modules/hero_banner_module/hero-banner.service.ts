import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class HeroBannerService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveBanners() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.heroBanner.findMany({
      where: {
        status: 'active',
        AND: [
          {
            OR: [{ startDate: null }, { startDate: { lte: today } }],
          },
          {
            OR: [{ endDate: null }, { endDate: { gte: today } }],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        buttonText: true,
        buttonLink: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }
}
