import * as SecureStore from 'expo-secure-store';

const K_ACCESS = 'eventaat_v1_access_token';
const K_REFRESH = 'eventaat_v1_refresh_token';
const K_SESSION = 'eventaat_v1_session_id';

export type StoredAuthTokens = {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
};

export async function saveTokens(t: StoredAuthTokens): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(K_ACCESS, t.accessToken),
    SecureStore.setItemAsync(K_REFRESH, t.refreshToken),
    SecureStore.setItemAsync(K_SESSION, t.sessionId),
  ]);
}

export async function loadTokens(): Promise<StoredAuthTokens | null> {
  const [accessToken, refreshToken, sessionId] = await Promise.all([
    SecureStore.getItemAsync(K_ACCESS),
    SecureStore.getItemAsync(K_REFRESH),
    SecureStore.getItemAsync(K_SESSION),
  ]);
  if (!accessToken || !refreshToken || !sessionId) {
    if (accessToken) await clearTokens();
    return null;
  }
  return { accessToken, refreshToken, sessionId };
}

export async function clearTokens(): Promise<void> {
  await Promise.all(
    [K_ACCESS, K_REFRESH, K_SESSION].map((k) => SecureStore.deleteItemAsync(k).catch(() => undefined)),
  );
}
