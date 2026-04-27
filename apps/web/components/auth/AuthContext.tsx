'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createAuthApi, type MeResult, type VerifyOtpResult } from '@eventaat/shared';
import {
  clearWebTokens,
  getWebApiBaseUrl,
  readWebTokens,
  writeWebTokens,
  type WebStoredTokens,
} from '@/lib/webAuthStorage';

type AuthCtx = {
  user: MeResult | null;
  accessToken: string | null;
  /** False until first client restore attempt finishes */
  ready: boolean;
  signInFromVerify: (r: VerifyOtpResult) => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const C = createContext<AuthCtx | null>(null);

export function WebAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeResult | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const base = getWebApiBaseUrl();
  const api = useMemo(() => createAuthApi(base), [base]);

  const refreshUser = useCallback(async () => {
    const t = readWebTokens();
    if (!t?.accessToken) {
      setUser(null);
      setAccessToken(null);
      return;
    }
    try {
      const u = await api.getMe(t.accessToken);
      setUser(u);
      setAccessToken(t.accessToken);
    } catch {
      clearWebTokens();
      setUser(null);
      setAccessToken(null);
    }
  }, [api]);

  useEffect(() => {
    void (async () => {
      await refreshUser();
      setReady(true);
    })();
  }, [refreshUser]);

  const signInFromVerify = useCallback(
    (r: VerifyOtpResult) => {
      const tok: WebStoredTokens = {
        accessToken: r.accessToken,
        refreshToken: r.refreshToken,
        sessionId: r.sessionId,
      };
      writeWebTokens(tok);
      setUser(r.user);
      setAccessToken(r.accessToken);
    },
    [],
  );

  const signOut = useCallback(async () => {
    const t = readWebTokens();
    if (t?.accessToken) {
      try {
        await api.logout(t.accessToken, { sessionId: t.sessionId });
      } catch {
        /* still clear */
      }
    }
    clearWebTokens();
    setUser(null);
    setAccessToken(null);
  }, [api]);

  const v = useMemo(
    () => ({ user, accessToken, ready, signInFromVerify, signOut, refreshUser }),
    [user, accessToken, ready, signInFromVerify, signOut, refreshUser],
  );

  return <C.Provider value={v}>{children}</C.Provider>;
}

export function useWebAuth() {
  const x = useContext(C);
  if (!x) throw new Error('useWebAuth');
  return x;
}
