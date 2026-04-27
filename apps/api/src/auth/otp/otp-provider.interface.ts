import type { OtpChannel, OtpPurpose } from '../../../generated/client';

/**
 * High-level transport selection (independent of request DTO `channel` when env overrides).
 */
export type OtpProviderKind = 'mock' | 'whatsapp' | 'sms';

/**
 * Delivery outcome; persisted on `OtpChallenge.providerStatus` (string) and audit-friendly.
 */
export type OtpDeliveryStatus = 'queued' | 'sent' | 'skipped' | 'failed';

export type OtpSendInput = {
  challengeId: string;
  /** E.164 e.g. +9647... */
  phone: string;
  phoneNormalized: string;
  channel: OtpChannel;
  purpose: OtpPurpose;
  /**
   * One-time use for transport (template param). Must never be logged, persisted, or sent to audit metadata.
   */
  code: string;
};

export type OtpSendResult = {
  provider: OtpProviderKind;
  /** WhatsApp / Graph message id when applicable */
  providerMessageId?: string;
  providerStatus: OtpDeliveryStatus;
  /** Sanitized, safe-for-DB JSON; must not include OTP or secrets */
  rawResponse?: Record<string, unknown>;
  errorMessage?: string;
};

/**
 * Pluggable OTP delivery. Implementations must not log the OTP or access tokens.
 */
export interface OtpDeliveryProvider {
  readonly name: OtpProviderKind;
  send(input: OtpSendInput): Promise<OtpSendResult>;
}
