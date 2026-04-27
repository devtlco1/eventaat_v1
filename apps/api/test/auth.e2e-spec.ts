import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupOpenApiDocs } from './../src/openapi.setup';
import { PrismaService } from './../src/prisma/prisma.service';

const hasDb = !!process.env.DATABASE_URL;
const hasJwt = !!process.env.JWT_ACCESS_SECRET;
const runAuthE2E = hasDb && hasJwt;

const testPhone = '+9647900000999';
const testPayload = { phone: testPhone, purpose: 'login', channel: 'manual' as const };

/** Full auth e2e requires PostgreSQL and schema applied (e.g. prisma db push or migrate). */
(runAuthE2E ? describe : describe.skip)('Auth API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    if (!runAuthE2E) {
      return;
    }
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    setupOpenApiDocs(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    if (!prisma) {
      return;
    }
    await prisma.auditLog.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.otpChallenge.deleteMany();
    await prisma.userRoleAssignment.deleteMany();
    await prisma.user.deleteMany();
  });

  it('POST /auth/otp/request returns challengeId and devOtp when AUTH_DEV_EXPOSE_OTP=true', async () => {
    process.env.AUTH_DEV_EXPOSE_OTP = 'true';
    const res = await request(app.getHttpServer())
      .post('/auth/otp/request')
      .send(testPayload)
      .expect(200);
    expect(res.body.challengeId).toBeDefined();
    expect(res.body.expiresAt).toBeDefined();
    expect(res.body.devOtp).toBeDefined();
    expect(String(res.body.devOtp).length).toBe(6);
  });

  it('POST /auth/otp/request does not expose devOtp when flag off', async () => {
    process.env.AUTH_DEV_EXPOSE_OTP = 'false';
    const res = await request(app.getHttpServer())
      .post('/auth/otp/request')
      .send({ ...testPayload, phone: '+9647900000888' })
      .expect(200);
    expect(res.body.devOtp).toBeUndefined();
  });

  it('POST /auth/otp/verify with wrong code increments and eventually 429', async () => {
    process.env.AUTH_DEV_EXPOSE_OTP = 'true';
    const r1 = await request(app.getHttpServer())
      .post('/auth/otp/request')
      .send({ ...testPayload, phone: '+9647900000777' })
      .expect(200);
    const { challengeId, devOtp } = r1.body;
    expect(devOtp).toBeDefined();

    let last = 0;
    for (let i = 0; i < 5; i++) {
      const r = await request(app.getHttpServer())
        .post('/auth/otp/verify')
        .send({ challengeId, code: '000000' });
      last = r.status;
      if (i < 4) {
        expect(r.status).toBe(400);
      }
    }
    expect(last).toBe(429);
  });

  it('POST /auth/otp/verify returns tokens, GET /auth/me, POST /auth/logout', async () => {
    process.env.AUTH_DEV_EXPOSE_OTP = 'true';
    const r1 = await request(app.getHttpServer())
      .post('/auth/otp/request')
      .send({ ...testPayload, phone: '+9647900000555' })
      .expect(200);
    const { challengeId, devOtp } = r1.body;
    const v = await request(app.getHttpServer())
      .post('/auth/otp/verify')
      .send({ challengeId, code: devOtp })
      .expect(200);
    const { accessToken, sessionId } = v.body;
    expect(accessToken).toBeDefined();
    expect(sessionId).toBeDefined();

    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(me.body.id).toBe(v.body.user.id);
    expect(me.body.roleAssignments).toBeDefined();

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(200);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });
});
