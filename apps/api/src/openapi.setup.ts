import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response } from 'express';

const OPENAPI_TITLE = 'eventaat API';
const OPENAPI_DESCRIPTION = 'Restaurant reservation platform API for eventaat.';
const OPENAPI_VERSION = '0.1.0';

/**
 * Registers Swagger UI at /docs, OpenAPI JSON at /openapi.json, and base document metadata.
 * Kept in one module so e2e tests can mirror production bootstrap.
 */
export function setupOpenApiDocs(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle(OPENAPI_TITLE)
    .setDescription(OPENAPI_DESCRIPTION)
    .setVersion(OPENAPI_VERSION)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const server = app.getHttpAdapter().getInstance();
  server.get(
    '/openapi.json',
    (_req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.json(document);
    },
  );

  SwaggerModule.setup('docs', app, document);
}
