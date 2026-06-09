import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Injectable()
export class AuthAppService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  }

  async completeOnboarding(userId: string, payload: CompleteOnboardingDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: payload.name.trim(),
        phone: payload.phone.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        emailVerified: true,
      },
    });
  }
}
