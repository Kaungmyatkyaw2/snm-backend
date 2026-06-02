import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { AuthAppController } from './auth.controller';
import { AuthAppService } from './auth.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthAppController],
  providers: [AuthAppService],
})
export class AuthAppModule {}
