import { Injectable } from '@nestjs/common';
import { OtpProviderConfig } from './otp-provider.config';
import {
  OtpSendInput,
  OtpSendResult,
  OtpDeliveryProvider,
} from './otp-provider.interface';

/**
 * SMS delivery placeholder. Phase 2C: no real vendor; mock / dry-run only.
 * For future: integrate an SMS provider — never log the OTP in implementation.
 */
@Injectable()
export class SmsOtpProvider implements OtpDeliveryProvider {
  readonly name = 'sms' as const;

  constructor(private readonly config: OtpProviderConfig) {}

  async send(_input: OtpSendInput): Promise<OtpSendResult> {
    if (this.config.smsDryRun) {
      return {
        provider: 'sms',
        providerStatus: 'skipped',
        rawResponse: {
          message: 'SMS is not integrated yet. SMS_DRY_RUN: no network call',
          note: 'Real SMS vendor is planned for a future release',
        },
      };
    }

    return {
      provider: 'sms',
      providerStatus: 'sent',
      rawResponse: {
        message: 'SMS placeholder: mock in-process send (no real vendor in Phase 2C)',
        smsProvider: this.config.smsProvider,
      },
    };
  }
}
