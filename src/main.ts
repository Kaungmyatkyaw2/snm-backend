import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { toNodeHandler } from 'better-auth/node';
import { useContainer } from 'class-validator';
import * as compression from 'compression';
import * as express from 'express';
import helmet from 'helmet';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const port = Number(process.env.PORT || 3001);

  const expressApp = app.getHttpAdapter().getInstance();
  const authService = app.get<AuthService>(AuthService);

  expressApp.all(/^\/api\/auth\/.*/, toNodeHandler(authService.instance.handler));
  expressApp.use(express.json());
  expressApp.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads')),
  );

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.use(
    compression({
      level: 6,
      threshold: 1024,
    }),
  );

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SNM Backend')
    .setDescription('SNM ecommerce backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      docExpansion: 'none',
    },
  });

  await app.listen(port, '0.0.0.0');
}

bootstrap();
