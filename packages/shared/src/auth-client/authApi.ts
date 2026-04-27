import { AuthApiError, AUTH_ERR_NETWORK } from './errors.js';
import type { LogoutInput, MeResult, RequestOtpInput, RequestOtpResult, VerifyOtpInput, VerifyOtpResult } from './types.js';

type ApiErrorJson = { message?: string; messageAr?: string; code?: string; statusCode?: number };

function normalizeBaseUrl(base: string): string {
  return base.replace(/\/$/, '');
}

function parseErrorBody(
  text: string,
): { json?: ApiErrorJson; message?: string; serverCode?: string } {
  try {
    const o = JSON.parse(text) as ApiErrorJson;
    const m =
      o.message && typeof o.message === 'string'
        ? o.message
        : typeof o.messageAr === 'string'
          ? o.messageAr
          : undefined;
    return { json: o, message: m, serverCode: o.code != null ? String(o.code) : undefined };
  } catch {
    return { message: text || undefined, json: undefined };
  }
}

function throwForFailedResponse(res: Response, text: string, fallback: string): never {
  const p = text ? parseErrorBody(text) : { message: res.statusText, json: undefined, serverCode: undefined };
  const msg = p.message ?? fallback;
  if (res.status === 400) {
    throw new AuthApiError('AUTH_ERR_BAD_REQUEST', msg, 400, p.serverCode);
  }
  if (res.status === 401) {
    throw new AuthApiError('AUTH_ERR_UNAUTHORIZED', msg, 401, p.serverCode);
  }
  if (res.status === 403) {
    throw new AuthApiError('AUTH_ERR_FORBIDDEN', msg, 403, p.serverCode);
  }
  if (res.status === 429) {
    throw new AuthApiError('AUTH_ERR_RATE', msg, 429, p.serverCode);
  }
  if (res.status === 502 || res.status === 503) {
    const delivery = p.json?.code === 'OTP_DELIVERY_FAILED';
    const code = delivery ? 'AUTH_ERR_DELIVERY' : 'AUTH_ERR_SERVER';
    throw new AuthApiError(code, msg, res.status, p.serverCode);
  }
  if (res.status >= 500) {
    throw new AuthApiError('AUTH_ERR_SERVER', msg, res.status, p.serverCode);
  }
  throw new AuthApiError('AUTH_ERR_HTTP', msg, res.status, p.serverCode);
}

/**
 * @param baseUrl — e.g. `https://api.example.com` (no trailing slash)
 */
export function createAuthApi(baseUrl: string) {
  const base = normalizeBaseUrl(baseUrl);

  async function jsonOk<T>(res: Response, fallbackLabel: string): Promise<T> {
    const text = await res.text();
    if (!res.ok) {
      throwForFailedResponse(res, text, fallbackLabel);
    }
    if (!text) {
      return {} as T;
    }
    return JSON.parse(text) as T;
  }

  return {
    async requestOtp(body: RequestOtpInput): Promise<RequestOtpResult> {
      let res: Response;
      try {
        res = await fetch(`${base}/auth/otp/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch {
        throw new AuthApiError(AUTH_ERR_NETWORK, 'Network request failed', 0);
      }
      const j = await jsonOk<{
        challengeId: string;
        expiresAt: string;
        channel: string;
        purpose: string;
        devOtp?: string;
      }>(res, 'Request OTP');
      return {
        challengeId: j.challengeId,
        expiresAt: typeof j.expiresAt === 'string' ? j.expiresAt : new Date(String(j.expiresAt)).toISOString(),
        channel: j.channel as RequestOtpResult['channel'],
        purpose: j.purpose as RequestOtpResult['purpose'],
        devOtp: j.devOtp,
      };
    },

    async verifyOtp(body: VerifyOtpInput): Promise<VerifyOtpResult> {
      let res: Response;
      try {
        res = await fetch(`${base}/auth/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch {
        throw new AuthApiError(AUTH_ERR_NETWORK, 'Network request failed', 0);
      }
      return jsonOk<VerifyOtpResult>(res, 'Verify OTP');
    },

    async getMe(accessToken: string): Promise<MeResult> {
      let res: Response;
      try {
        res = await fetch(`${base}/auth/me`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch {
        throw new AuthApiError(AUTH_ERR_NETWORK, 'Network request failed', 0);
      }
      return jsonOk<MeResult>(res, 'Get me');
    },

    async logout(accessToken: string, body: LogoutInput = {}): Promise<void> {
      let res: Response;
      try {
        res = await fetch(`${base}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(body),
        });
      } catch {
        throw new AuthApiError(AUTH_ERR_NETWORK, 'Network request failed', 0);
      }
      if (res.status === 401 || res.status === 404) {
        return;
      }
      if (res.status >= 500) {
        const t = await res.text();
        const p = t ? parseErrorBody(t) : {};
        throw new AuthApiError('AUTH_ERR_SERVER', p.message ?? 'Logout failed', res.status, p.serverCode);
      }
      if (!res.ok) {
        return; // 4xx other than 401/404: still clear local session
      }
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
