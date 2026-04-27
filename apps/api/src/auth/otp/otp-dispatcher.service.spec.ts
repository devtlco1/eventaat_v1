import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { OtpProviderConfig } from './otp-provider.config';
import { OtpDispatcherService } from './otp-dispatcher.service';
import { MockOtpProvider } from './mock-otp.provider';
import { WhatsappOtpProvider } from './whatsapp-otp.provider';
import { SmsOtpProvider } from './sms-otp.provider';

const baseInput = {
  challengeId: 'ch_1',
  phone: '+9647700000001',
  phoneNormalized: '+9647700000001',
  channel: 'whatsapp' as const,
  purpose: 'login' as const,
  code: '000000',
};

function configModuleMock(env: Record<string, string | undefined>) {
  return {
    get: (key: string, def?: string) => env[key] ?? def,
    getOrThrow: (key: string) => {
      if (key in env && env[key] != null) return env[key]!;
      throw new Error(key);
    },
  } as unknown as ConfigService;
}

describe('OtpDispatcherService', () => {
  it('defaults to mock and returns skipped', async () => {
    const env: Record<string, string | undefined> = {
      OTP_DELIVERY_PROVIDER: 'mock',
      OTP_DELIVERY_DRY_RUN: 'true',
    };
    const mod = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: configModuleMock(env) },
        OtpProviderConfig,
        MockOtpProvider,
        WhatsappOtpProvider,
        SmsOtpProvider,
        OtpDispatcherService,
      ],
    }).compile();
    const s = mod.get(OtpDispatcherService);
    const r = await s.send({ ...baseInput, code: '123456' });
    expect(r.provider).toBe('mock');
    expect(r.providerStatus).toBe('skipped');
  });

  it('when provider is sms, uses SMS placeholder (skipped in dry run)', async () => {
    const env: Record<string, string | undefined> = {
      OTP_DELIVERY_PROVIDER: 'sms',
      OTP_DELIVERY_DRY_RUN: 'true',
      SMS_DRY_RUN: 'true',
    };
    const mod = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: configModuleMock(env) },
        OtpProviderConfig,
        MockOtpProvider,
        WhatsappOtpProvider,
        SmsOtpProvider,
        OtpDispatcherService,
      ],
    }).compile();
    const s = mod.get(OtpDispatcherService);
    const r = await s.send({ ...baseInput, code: '123456' });
    expect(r.provider).toBe('sms');
    expect(r.providerStatus).toBe('skipped');
  });

  it('does not pass OTP in Logger output', async () => {
    const env: Record<string, string | undefined> = {
      OTP_DELIVERY_PROVIDER: 'mock',
      OTP_DELIVERY_DRY_RUN: 'true',
    };
    const mod = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: configModuleMock(env) },
        OtpProviderConfig,
        MockOtpProvider,
        WhatsappOtpProvider,
        SmsOtpProvider,
        OtpDispatcherService,
      ],
    }).compile();
    const s = mod.get(OtpDispatcherService);
    const spy = jest.spyOn(Logger.prototype, 'debug');
    const secret = 'SECRET999888';
    await s.send({ ...baseInput, code: secret });
    for (const call of spy.mock.calls) {
      expect(String(call[1])).not.toContain(secret);
    }
    spy.mockRestore();
  });
});
