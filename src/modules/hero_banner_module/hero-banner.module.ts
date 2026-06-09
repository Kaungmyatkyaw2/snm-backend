import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { HeroBannerController } from './hero-banner.controller';
import { HeroBannerService } from './hero-banner.service';

@Module({
  imports: [PrismaModule],
  controllers: [HeroBannerController],
  providers: [HeroBannerService],
})
export class HeroBannerModule {}
