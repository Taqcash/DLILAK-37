import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import next from 'next';
import { parse } from 'url';
import path from 'path';

async function bootstrap() {
  const dev = process.env.NODE_ENV !== 'production';
  const nextApp = next({ dev });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();
  const server = express();

  let AppModule: any;
  if (dev) {
    const module = await import('./src/backend/app.module');
    AppModule = module.AppModule;
  } else {
    const module = await import(path.join(__dirname, 'src/backend/app.module.js'));
    AppModule = module.AppModule;
  }

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.setGlobalPrefix('api/v1');
  await app.init();

  server.all(/.*/, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen(port, '0.0.0.0', () => {
    console.log(`> Claw Engine running on http://localhost:${port}`);
  });
}

bootstrap();
