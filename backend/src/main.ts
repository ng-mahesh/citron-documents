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

    // Allow any subdomain of citronsociety.in (covers documents, dev-m, dev, m,
    // production root, etc.) plus localhost for development. Using a regex
    // matcher avoids hard-failing when a per-environment FRONTEND_URL env var
    // is missing/misspelled — the most common reason this was breaking on iOS
    // Safari, which sends a strict preflight and times out faster than Chrome.
    const CITRON_DOMAIN_REGEX = /^https:\/\/([a-z0-9-]+\.)*citronsociety\.in$/i;
    const LOCALHOST_REGEX = /^http:\/\/localhost(?::\d+)?$/i;

    app.enableCors({
      origin: (origin, callback) => {
        // No Origin header (server-to-server, curl, native apps) — allow
        if (!origin) return callback(null, true);
        const ok = CITRON_DOMAIN_REGEX.test(origin) || LOCALHOST_REGEX.test(origin);
        callback(null, ok);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      // Cache the preflight for 24h so Safari doesn't re-preflight on every
      // exchange call (helps reduce cold-start CORS timeouts on Vercel).
      maxAge: 86400,
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
