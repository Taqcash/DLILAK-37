import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import next from 'next';
import { parse } from 'url';
import { AppModule } from './src/backend/app.module';

async function bootstrap() {
  try {
    const dev = process.env.NODE_ENV !== 'production';
    const nextApp = next({ dev });
    const handle = nextApp.getRequestHandler();

    console.log('> Preparing Next.js...');
    await nextApp.prepare();

    const server = express();
    
    console.log('> Initializing NestJS...');
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    
    app.setGlobalPrefix('api/v1'); // NestJS API prefix
    await app.init();

    // Handle Next.js requests
    server.all(/.*/, (req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    });

    const port = 3000;
    server.listen(port, '0.0.0.0', () => {
      console.log(`> Claw Engine running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('> Bootstrap failed:', err);
    process.exit(1);
  }
}

bootstrap();
