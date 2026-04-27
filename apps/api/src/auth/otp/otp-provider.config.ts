import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type OtpDeliveryMode = 'mock' | 'whatsapp' | 'sms';

/**
 * Centralized, typed reads for OTP delivery. Prefer this over ad-hoc `process.env` in providers.
 */
@Injectable()
export class OtpProviderConfig {
  constructor(private readonly config: ConfigService) {}

  get deliveryMode(): OtpDeliveryMode {
    const v = (this.config.get<string>('OTP_DELIVERY_PROVIDER', 'mock') ?? 'mock').toLowerCase();
    if (v === 'whatsapp' || v === 'sms' || v === 'mock') {
      return v;
    }
    return 'mock';
  }

  /** When true, WhatsApp (and any future HTTP) providers must not call external networks. */
  get globalDryRun(): boolean {
    return (this.config.get<string>('OTP_DELIVERY_DRY_RUN', 'true') ?? 'true').toLowerCase() === 'true';
  }

  get whatsappBaseUrl(): string {
    return (this.config.get<string>('WHATSAPP_CLOUD_API_BASE_URL') ?? 'https://graph.facebook.com').replace(
      /\/$/,
      '',
    );
  }

  get whatsappApiVersion(): string {
    return (this.config.get<string>('WHATSAPP_API_VERSION') ?? 'v21.0').trim();
  }

  get whatsappPhoneNumberId(): string {
    return (this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID') ?? '').trim();
  }

  get whatsappAccessToken(): string {
    return (this.config.get<string>('WHATSAPP_ACCESS_TOKEN') ?? '').trim();
  }

  get whatsappTemplateName(): string {
    return (this.config.get<string>('WHATSAPP_OTP_TEMPLATE_NAME') ?? 'eventaat_otp_login').trim();
  }

  get whatsappTemplateLanguage(): string {
    return (this.config.get<string>('WHATSAPP_OTP_TEMPLATE_LANGUAGE') ?? 'ar').trim();
  }

  get whatsappTimeoutMs(): number {
    const t = parseInt(this.config.get<string>('WHATSAPP_REQUEST_TIMEOUT_MS', '10000') ?? '10000', 10);
    return Number.isFinite(t) && t > 0 ? t : 10000;
  }

  get smsProvider(): 'mock' {
    const v = (this.config.get<string>('SMS_PROVIDER', 'mock') ?? 'mock').toLowerCase();
    return v === 'mock' ? 'mock' : 'mock';
  }

  get smsDryRun(): boolean {
    return (this.config.get<string>('SMS_DRY_RUN', 'true') ?? 'true').toLowerCase() === 'true';
  }

  /**
   * True if WhatsApp is selected and (non-dry) required credentials are present.
   */
  whatsappCredentialsPresent(): boolean {
    return this.whatsappPhoneNumberId.length > 0 && this.whatsappAccessToken.length > 0;
  }
}
