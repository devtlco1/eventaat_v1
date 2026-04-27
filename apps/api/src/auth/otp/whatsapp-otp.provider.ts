import { Injectable, Logger } from '@nestjs/common';
import { OtpProviderConfig } from './otp-provider.config';
import {
  OtpSendInput,
  OtpSendResult,
  OtpDeliveryProvider,
} from './otp-provider.interface';

/**
 * WhatsApp Cloud API (Graph) template message for OTP.
 * Does not log the OTP or access token. Response is sanitized for metadata.
 */
@Injectable()
export class WhatsappOtpProvider implements OtpDeliveryProvider {
  readonly name = 'whatsapp' as const;
  private readonly log = new Logger(WhatsappOtpProvider.name);

  constructor(private readonly config: OtpProviderConfig) {}

  async send(input: OtpSendInput): Promise<OtpSendResult> {
    if (this.config.globalDryRun) {
      return {
        provider: 'whatsapp',
        providerStatus: 'skipped',
        rawResponse: { dryRun: true, note: 'OTP_DELIVERY_DRY_RUN: no network call' },
      };
    }

    if (!this.config.whatsappCredentialsPresent()) {
      return {
        provider: 'whatsapp',
        providerStatus: 'failed',
        errorMessage: 'WhatsApp delivery is not configured. Missing phone number id or access token.',
      };
    }

    const to = this.stripPlusForGraph(input.phoneNormalized);
    const url = this.buildMessageUrl();
    const body = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: this.config.whatsappTemplateName,
        language: { code: this.config.whatsappTemplateLanguage },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text' as const, text: input.code }],
          },
        ],
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.whatsappTimeoutMs);
    const token = this.config.whatsappAccessToken;

    try {
      // Token intentionally omitted from all logs
      this.log.log(`WhatsApp send: POST ${this.maskUrl(url)}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const json = (await this.safeJson(res)) as unknown;
      const safe = this.sanitizeResponse(json, res);

      if (!res.ok) {
        const errMsg = this.readGraphError(safe) ?? res.statusText ?? 'WhatsApp request failed';
        this.log.warn(`WhatsApp error response status=${res.status}`);
        return {
          provider: 'whatsapp',
          providerStatus: 'failed',
          rawResponse: safe,
          errorMessage: `WhatsApp delivery failed: ${errMsg}`,
        };
      }

      const id = this.extractMessageId(safe);
      return {
        provider: 'whatsapp',
        providerMessageId: id,
        providerStatus: 'sent',
        rawResponse: safe,
      };
    } catch (e) {
      const isAbort = e instanceof Error && e.name === 'AbortError';
      const errMsg = isAbort
        ? `Request timed out after ${this.config.whatsappTimeoutMs}ms`
        : e instanceof Error
          ? e.message
          : 'Unknown error';
      this.log.warn(`WhatsApp network error: ${isAbort ? 'timeout' : 'request failed'}`);
      return {
        provider: 'whatsapp',
        providerStatus: 'failed',
        errorMessage: `WhatsApp delivery failed: ${errMsg}`,
        rawResponse: { network: true, aborted: isAbort },
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildMessageUrl(): string {
    const base = this.config.whatsappBaseUrl;
    const v = this.config.whatsappApiVersion;
    const id = this.config.whatsappPhoneNumberId;
    return `${base}/${v}/${id}/messages`;
  }

  private maskUrl(url: string): string {
    return url.replace(/access_token=[^&]+/gi, 'access_token=[redacted]');
  }

  private stripPlusForGraph(e164: string): string {
    return e164.replace(/^\+/, '');
  }

  private async safeJson(res: Response): Promise<unknown> {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return { parseError: true, rawLength: text.length };
    }
  }

  /**
   * Whitelist high-level fields from Graph; strip nested blobs that may contain PII.
   */
  private sanitizeResponse(json: unknown, res: Response): Record<string, unknown> {
    if (!json || typeof json !== 'object') {
      return { status: res.status, empty: true };
    }
    const o = json as Record<string, unknown>;
    const out: Record<string, unknown> = {
      httpStatus: res.status,
    };
    if (o.messaging_product) out.messaging_product = o.messaging_product;
    if (o.messages) out.messages = o.messages;
    if (o.contacts) out.contacts = o.contacts;
    if (o.error) {
      const e = o.error;
      if (e && typeof e === 'object') {
        const er = e as Record<string, unknown>;
        out.error = {
          message: er.message,
          code: er.code,
          type: er.type,
          error_subcode: er.error_subcode,
        };
      }
    }
    return out;
  }

  private readGraphError(safe: Record<string, unknown>): string | undefined {
    const err = safe.error;
    if (err && typeof err === 'object') {
      const m = (err as Record<string, unknown>).message;
      if (typeof m === 'string') return m;
    }
    return undefined;
  }

  private extractMessageId(safe: unknown): string | undefined {
    if (!safe || typeof safe !== 'object') return undefined;
    const o = safe as { messages?: Array<{ id?: string }> };
    const m = o.messages;
    if (Array.isArray(m) && m[0]?.id) {
      return m[0].id;
    }
    return undefined;
  }
}
