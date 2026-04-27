import { Injectable, Logger } from '@nestjs/common';
import { OtpChannel, OtpPurpose } from '../../generated/client';

/**
 * No external WhatsApp/SMS in Phase 2B. Implementations may log (dev) only.
 */
export type OtpDispatchPayload = {
  phone: string;
  phoneNormalized: string;
  channel: OtpChannel;
  purpose: OtpPurpose;
  /** Never logged in production; dev-only logging may omit the code. */
  challengeId: string;
};

@Injectable()
export class OtpDispatcherService {
  private readonly log = new Logger(OtpDispatcherService.name);

  /**
   * Simulates sending OTP. No HTTP calls; suitable for dev/test and future 2C provider.
   */
  async dispatch(_payload: OtpDispatchPayload): Promise<void> {
    this.log.debug('OTP channel dispatch skipped (no real provider, Phase 2B).');
  }
}
