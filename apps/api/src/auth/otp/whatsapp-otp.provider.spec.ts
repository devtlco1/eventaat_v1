import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OtpProviderConfig } from './otp-provider.config';
import { WhatsappOtpProvider } from './whatsapp-otp.provider';

const input = {
  challengeId: 'c1',
  phone: '+9647700000001',
  phoneNormalized: '+9647700000001',
  channel: 'whatsapp' as const,
  purpose: 'login' as const,
  code: '654321',
};

function makeConfig(env: Record<string, string | undefined>) {
  return {
    get: (key: string, def?: string) => (env[key] != null ? env[key]! : def),
  } as unknown as ConfigService;
}

describe('WhatsappOtpProvider', () => {
  const oldFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = oldFetch;
    jest.clearAllMocks();
  });

  it('does not call the network when OTP_DELIVERY_DRY_RUN is true', async () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock;
    const mod = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: makeConfig({ OTP_DELIVERY_DRY_RUN: 'true' }) },
        OtpProviderConfig,
        WhatsappOtpProvider,
      ],
    }).compile();
    const p = mod.get(WhatsappOtpProvider);
    const r = await p.send(input);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(r.provider).toBe('whatsapp');
    expect(r.providerStatus).toBe('skipped');
  });

  it('fails clearly when required config is missing (not dry run)', async () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock;
    const mod = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: makeConfig({
            OTP_DELIVERY_DRY_RUN: 'false',
            WHATSAPP_PHONE_NUMBER_ID: '',
            WHATSAPP_ACCESS_TOKEN: '',
          }),
        },
        OtpProviderConfig,
        WhatsappOtpProvider,
      ],
    }).compile();
    const p = mod.get(WhatsappOtpProvider);
    const r = await p.send(input);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(r.providerStatus).toBe('failed');
    expect(r.errorMessage).toBe(
      'WhatsApp delivery is not configured. Missing phone number id or access token.',
    );
  });

  it('returns sent with message id and sanitized response; never exposes token in rawResponse', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ messaging_product: 'whatsapp', messages: [{ id: 'wamid.1' }], access_token: 'X' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    globalThis.fetch = fetchMock;

    const mod = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: makeConfig({
            OTP_DELIVERY_DRY_RUN: 'false',
            WHATSAPP_PHONE_NUMBER_ID: '123',
            WHATSAPP_ACCESS_TOKEN: 'secret-wa-token',
            WHATSAPP_CLOUD_API_BASE_URL: 'https://graph.facebook.com',
            WHATSAPP_API_VERSION: 'v19.0',
            WHATSAPP_REQUEST_TIMEOUT_MS: '5000',
            WHATSAPP_OTP_TEMPLATE_NAME: 't1',
            WHATSAPP_OTP_TEMPLATE_LANGUAGE: 'en',
          }),
        },
        OtpProviderConfig,
        WhatsappOtpProvider,
      ],
    }).compile();
    const p = mod.get(WhatsappOtpProvider);
    const r = await p.send(input);
    expect(fetchMock).toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[0];
    const headers = (init as { headers: Record<string, string> }).headers;
    expect(String(headers['Authorization'])).toContain('Bearer');
    const sentBody = JSON.parse((init as { body: string }).body);
    expect(sentBody.template?.components?.[0]?.parameters?.[0]?.text).toBe('654321');
    expect(r.providerMessageId).toBe('wamid.1');
    expect(r.providerStatus).toBe('sent');
    expect(r.rawResponse).toBeDefined();
    expect(String(JSON.stringify(r.rawResponse)).includes('access_token')).toBe(false);
    expect(String(JSON.stringify(r.rawResponse)).toLowerCase()).not.toContain('secret');
  });
});
