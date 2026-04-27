import { Injectable, Logger } from '@nestjs/common';
import { OtpProviderConfig } from './otp-provider.config';
import { OtpSendInput, OtpSendResult } from './otp-provider.interface';
import { MockOtpProvider } from './mock-otp.provider';
import { WhatsappOtpProvider } from './whatsapp-otp.provider';
import { SmsOtpProvider } from './sms-otp.provider';

/**
 * Routes OTP delivery to the configured provider. Must not log `_input.code`.
 */
@Injectable()
export class OtpDispatcherService {
  private readonly log = new Logger(OtpDispatcherService.name);

  constructor(
    private readonly config: OtpProviderConfig,
    private readonly mock: MockOtpProvider,
    private readonly whatsapp: WhatsappOtpProvider,
    private readonly sms: SmsOtpProvider,
  ) {}

  async send(input: OtpSendInput): Promise<OtpSendResult> {
    const mode = this.config.deliveryMode;
    this.log.debug(`OTP dispatch mode=${mode} challengeId=${input.challengeId} (code not logged)`);

    switch (mode) {
      case 'whatsapp':
        return this.whatsapp.send(input);
      case 'sms':
        return this.sms.send(input);
      case 'mock':
      default:
        return this.mock.send(input);
    }
  }
}
