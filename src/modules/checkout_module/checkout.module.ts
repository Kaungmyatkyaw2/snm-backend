import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { CartModule } from '../cart_module/cart.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

@Module({
  imports: [PrismaModule, CartModule],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
