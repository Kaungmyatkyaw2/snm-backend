import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './common/auth';
import { PrismaModule } from './database/prisma.module';
import { AuthAppModule } from './modules/auth_module/auth.module';
import { BrandModule } from './modules/brand_module/brand.module';
import { CartModule } from './modules/cart_module/cart.module';
import { CategoryModule } from './modules/category_module/category.module';
import { CheckoutModule } from './modules/checkout_module/checkout.module';
import { MediaModule } from './modules/media_module/media.module';
import { ProductModule } from './modules/product_module/product.module';

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
    CategoryModule,
    BrandModule,
    ProductModule,
    CartModule,
    CheckoutModule,
    MediaModule,
  ],
})
export class AppModule {}
