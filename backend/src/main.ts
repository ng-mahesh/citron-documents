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

    // Enable CORS for frontend communication
    // Remove trailing slash if present to ensure exact match
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

    app.enableCors({
      origin: frontendUrl,
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
