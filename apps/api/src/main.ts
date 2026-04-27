import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupOpenApiDocs } from './openapi.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
