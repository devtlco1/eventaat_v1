import { Injectable } from '@nestjs/common';
import {
  OtpSendInput,
  OtpSendResult,
  OtpDeliveryProvider,
} from './otp-provider.interface';

@Injectable()
export class MockOtpProvider implements OtpDeliveryProvider {
  readonly name = 'mock' as const;

  async send(_input: OtpSendInput): Promise<OtpSendResult> {
    // Never log, persist, or return _input.code
    return {
      provider: 'mock',
      providerStatus: 'skipped',
      rawResponse: { message: 'Mock provider: no external delivery' },
    };
  }
}
