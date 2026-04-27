import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OtpProviderConfig } from './otp-provider.config';
import { SmsOtpProvider } from './sms-otp.provider';

const input = {
  challengeId: 'c1',
  phone: '+9647700000001',
  phoneNormalized: '+9647700000001',
  channel: 'sms' as const,
  purpose: 'login' as const,
  code: '111222',
};

function makeConfig(env: Record<string, string | undefined>) {
  return { get: (key: string, def?: string) => (env[key] != null ? env[key]! : def) } as unknown as ConfigService;
}

describe('SmsOtpProvider', () => {
  it('returns skipped in dry run with a safe result', async () => {
    const mod = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: makeConfig({ SMS_DRY_RUN: 'true' }) },
        OtpProviderConfig,
        SmsOtpProvider,
      ],
    }).compile();
    const p = mod.get(SmsOtpProvider);
    const r = await p.send(input);
    expect(r.provider).toBe('sms');
    expect(r.providerStatus).toBe('skipped');
    expect(r.rawResponse?.['message']).toBeDefined();
    expect(JSON.stringify(r)).not.toContain('111222');
  });
});
