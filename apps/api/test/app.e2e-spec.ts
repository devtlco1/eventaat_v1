import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupOpenApiDocs } from './../src/openapi.setup';
import { PrismaService } from './../src/prisma/prisma.service';

describe('API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        onModuleDestroy: async () => undefined,
        $disconnect: async () => undefined,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    setupOpenApiDocs(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ status: 'ok', app: 'eventaat' });
      });
  });

  it('GET /docs (Swagger UI)', () => {
    return request(app.getHttpServer())
      .get('/docs')
      .expect(200)
      .expect('Content-Type', /html/);
  });

  it('GET /openapi.json', () => {
    return request(app.getHttpServer())
      .get('/openapi.json')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body).toMatchObject({
          openapi: '3.0.0',
          info: { title: 'eventaat API', version: '0.1.0' },
        });
        expect(res.body.paths).toHaveProperty('/health');
      });
  });
});
