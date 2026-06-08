import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './common/auth';
import { PrismaModule } from './database/prisma.module';
import { AddressModule } from './modules/address_module/address.module';
import { AuthAppModule } from './modules/auth_module/auth.module';
import { BrandModule } from './modules/brand_module/brand.module';
import { CartModule } from './modules/cart_module/cart.module';
import { CategoryModule } from './modules/category_module/category.module';
import { CheckoutModule } from './modules/checkout_module/checkout.module';
import { LoyaltyModule } from './modules/loyalty_module/loyalty.module';
import { MediaModule } from './modules/media_module/media.module';
import { NotificationModule } from './modules/notification_module/notification.module';
import { OrderModule } from './modules/order_module/order.module';
import { PaymentModule } from './modules/payment_module/payment.module';
import { ProductModule } from './modules/product_module/product.module';
import { WishlistModule } from './modules/wishlist_module/wishlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_TIME_STAMP || 60000),
        limit: Number(process.env.RATE_LIMIT_COUNT || 120),
      },
    ]),
    AuthModule.forRootAsync({
      useFactory: () => ({
        auth,
      }),
    }),
    PrismaModule,
    AuthAppModule,
    AddressModule,
    CategoryModule,
    BrandModule,
    ProductModule,
    CartModule,
    CheckoutModule,
    LoyaltyModule,
    MediaModule,
    NotificationModule,
    OrderModule,
    PaymentModule,
    WishlistModule,
  ],
})
export class AppModule {}
