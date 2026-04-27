import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OtpProviderConfig } from './otp-provider.config';

function makeConfig(env: Record<string, string | undefined>) {
  return {
    get: (key: string, def?: string) => (env[key] != null ? env[key]! : def),
  } as unknown as ConfigService;
}

describe('OtpProviderConfig', () => {
  it('defaults delivery mode to mock', async () => {
    const mod = await Test.createTestingModule({
      providers: [{ provide: ConfigService, useValue: makeConfig({}) }, OtpProviderConfig],
    }).compile();
    const c = mod.get(OtpProviderConfig);
    expect(c.deliveryMode).toBe('mock');
  });

  it('treats unknown provider as mock', async () => {
    const mod = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: makeConfig({ OTP_DELIVERY_PROVIDER: 'unknown' }) },
        OtpProviderConfig,
      ],
    }).compile();
    expect(mod.get(OtpProviderConfig).deliveryMode).toBe('mock');
  });
});
