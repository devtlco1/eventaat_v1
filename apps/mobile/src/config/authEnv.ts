/**
 * @see docs/frontend-auth-integration.md — `EXPO_PUBLIC_API_BASE_URL`, physical device vs localhost.
 */
export function getExpoApiBaseUrl(): string {
  return (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim();
}

/**
 * When true, the app uses the real eventaat API; when false, legacy mock-only auth UI is available.
 * Set `EXPO_PUBLIC_MOCK_AUTH=true` to force mock flow even if a base URL is set.
 */
export function useRealAuth(): boolean {
  if ((process.env.EXPO_PUBLIC_MOCK_AUTH ?? '').toLowerCase() === 'true') {
    return false;
  }
  return getExpoApiBaseUrl().length > 0;
}
