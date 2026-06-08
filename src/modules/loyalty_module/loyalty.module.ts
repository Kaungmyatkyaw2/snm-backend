import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';

@Module({
  controllers: [LoyaltyController],
  providers: [LoyaltyService, PrismaService],
})
export class LoyaltyModule {}
