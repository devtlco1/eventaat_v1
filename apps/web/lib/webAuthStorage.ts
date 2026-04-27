/**
 * Prototype token storage in localStorage. TODO (production): prefer httpOnly cookies or hardened session transport.
 */
const K_ACCESS = 'eventaat_v1_web_access';
const K_REFRESH = 'eventaat_v1_web_refresh';
const K_SESSION = 'eventaat_v1_web_session';

export type WebStoredTokens = {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
};

export function readWebTokens(): WebStoredTokens | null {
  if (typeof window === 'undefined') return null;
  try {
    const accessToken = localStorage.getItem(K_ACCESS);
    const refreshToken = localStorage.getItem(K_REFRESH);
    const sessionId = localStorage.getItem(K_SESSION);
    if (!accessToken || !refreshToken || !sessionId) return null;
    return { accessToken, refreshToken, sessionId };
  } catch {
    return null;
  }
}

export function writeWebTokens(t: WebStoredTokens): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(K_ACCESS, t.accessToken);
  localStorage.setItem(K_REFRESH, t.refreshToken);
  localStorage.setItem(K_SESSION, t.sessionId);
}

export function clearWebTokens(): void {
  if (typeof window === 'undefined') return;
  [K_ACCESS, K_REFRESH, K_SESSION].forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
}

export function isAuthRequired(): boolean {
  return (process.env.NEXT_PUBLIC_AUTH_REQUIRED ?? 'false').toLowerCase() === 'true';
}

export function getWebApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
}
