import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupOpenApiDocs } from './openapi.setup';

const defaultCorsOrigins = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const raw = config.get<string>('CORS_ORIGINS', '');
  const fromEnv = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const allowAll =
    (config.get<string>('CORS_ALLOW_DEV_ALL', 'false') ?? 'false').toLowerCase() === 'true';
  if (allowAll) {
    app.enableCors({ origin: true, credentials: true });
  } else {
    app.enableCors({
      origin: fromEnv.length > 0 ? fromEnv : defaultCorsOrigins,
      credentials: true,
    });
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  setupOpenApiDocs(app);
  const port = process.env.API_PORT ?? process.env.PORT ?? 3000;
  await app.listen(port);
}
void bootstrap();
