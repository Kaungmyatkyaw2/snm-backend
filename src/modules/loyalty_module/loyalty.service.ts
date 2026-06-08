import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyWallet(userId: string) {
    const wallet = await this.prisma.loyaltyWallet.findUnique({
      where: { userId },
      select: {
        id: true,
        pointsBalance: true,
        referralCode: true,
      },
    });

    return {
      wallet: wallet ?? {
        id: null,
        pointsBalance: 0,
        referralCode: null,
      },
    };
  }
}
