import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express from 'express';

const server = express();
let cachedApp;

/**
 * Bootstrap function to initialize the NestJS application
 */
async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    // Allow citron frontend + society management frontend/PWA
    const allowedOrigins = [
      process.env.FRONTEND_URL, // citron frontend (documents.citronsociety.in)
      process.env.SOCIETY_FRONTEND_URL, // society management web (citronsociety.in)
      process.env.SOCIETY_PWA_URL, // society management PWA (same origin or separate)
      'http://localhost:3000', // society frontend dev
      'http://localhost:3002', // society PWA dev
      'http://localhost:4001', // citron frontend dev
    ]
      .filter(Boolean)
      .map((u) => (u as string).replace(/\/$/, ''));

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });

    // Enable global validation pipe for DTO validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Set global API prefix
    app.setGlobalPrefix('api');

    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 4000;
  bootstrap().then((app) => {
    app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  });
}

// Serverless handler for Vercel
export default async (req, res) => {
  await bootstrap();
  return server(req, res);
};
