import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createAuthApi, mockReservations, type Reservation, type UserPublic } from '@eventaat/shared';
import type { CustomerScreen, MainTab } from '../navigation/types';
import { getExpoApiBaseUrl, useRealAuth } from '../config/authEnv';
import { clearTokens, loadTokens, saveTokens, type StoredAuthTokens } from '../auth/tokenStorage';
import {
  findReservationById,
  GUEST_CUSTOMER_ID,
  mergeCustomerReservations,
} from '../utils/reservations';

type UserSession = { id: string; displayName: string; phone: string; city: string };

type SessionState =
  | { kind: 'none' }
  | { kind: 'guest' }
  | { kind: 'user'; user: UserSession; auth: 'api' | 'mock' };

type Ctx = {
  session: SessionState;
  authRestoring: boolean;
  useApiAuth: boolean;
  enterAsGuest: () => void;
  setSessionFromLogin: (u: { displayName: string; phone: string; city: string }) => void;
  setSessionFromVerify: (u: UserPublic, tokens: StoredAuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  localReservations: Reservation[];
  setLocalReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  addLocalReservation: (r: Reservation) => void;
  updateLocalReservation: (id: string, patch: Partial<Reservation>) => void;
  mergedForCurrentCustomer: () => Reservation[];
  findReservation: (id: string) => Reservation | undefined;
  statusOverrides: Record<string, Reservation['status']>;
  setStatusOverride: (id: string, s: Reservation['status']) => void;
  currentCustomerId: string | null;
  screen: CustomerScreen;
  stack: CustomerScreen[];
  push: (s: CustomerScreen) => void;
  replace: (s: CustomerScreen) => void;
  pop: () => void;
  mainTab: MainTab;
  setMainTab: (t: MainTab) => void;
  goToMainTab: (t: MainTab) => void;
};

const AppCtx = createContext<Ctx | null>(null);

function toDisplayUserFromPublic(u: UserPublic): UserSession {
  return {
    id: u.id,
    displayName: (u.fullName && u.fullName.trim()) || 'زبون',
    phone: u.phone,
    city: (u.city && u.city.trim()) || '—',
  };
}

const MOCK_U_ID = 'u_c1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionState>({ kind: 'none' });
  const [authRestoring, setAuthRestoring] = useState(() => useRealAuth());
  const [localReservations, setLocalReservations] = useState<Reservation[]>([]);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Reservation['status']>>({});
  const [stack, setStack] = useState<CustomerScreen[]>([{ name: 'welcome' }]);
  const [mainTab, setMainTab] = useState<MainTab>('home');

  const useApiAuth = useRealAuth();
  const baseUrl = getExpoApiBaseUrl();
  const api = useMemo(
    () => (baseUrl ? createAuthApi(baseUrl) : null),
    [baseUrl],
  );

  const screen = stack[stack.length - 1]!;

  useEffect(() => {
    if (!useApiAuth || !api) {
      setAuthRestoring(false);
      return;
    }
    let cancel = false;
    void (async () => {
      try {
        const t = await loadTokens();
        if (!t?.accessToken) {
          if (!cancel) setAuthRestoring(false);
          return;
        }
        const u = await api.getMe(t.accessToken);
        if (cancel) return;
        setSession({ kind: 'user', user: toDisplayUserFromPublic(u), auth: 'api' });
        setMainTab('home');
        setStack([{ name: 'home' }]);
      } catch {
        await clearTokens();
        if (cancel) return;
        if (!cancel) setStack([{ name: 'welcome' }]);
      } finally {
        if (!cancel) setAuthRestoring(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [useApiAuth, api]);

  const currentCustomerId = useMemo(() => {
    if (session.kind === 'user') return session.user.id;
    if (session.kind === 'guest') return GUEST_CUSTOMER_ID;
    return null;
  }, [session]);

  const mergedForCurrentCustomer = useCallback((): Reservation[] => {
    if (session.kind === 'none') return [];
    const base =
      session.kind === 'guest'
        ? mergeCustomerReservations(GUEST_CUSTOMER_ID, mockReservations, localReservations)
        : mergeCustomerReservations(session.user.id, mockReservations, localReservations);
    return base.map((r) => (statusOverrides[r.id] ? { ...r, status: statusOverrides[r.id]! } : r));
  }, [session, localReservations, statusOverrides]);

  const findReservation = useCallback(
    (id: string) => {
      const r = findReservationById(id, mockReservations, localReservations);
      if (!r) return undefined;
      const o = statusOverrides[id];
      return o ? { ...r, status: o } : r;
    },
    [localReservations, statusOverrides],
  );

  const setStatusOverride = useCallback((id: string, s: Reservation['status']) => {
    setStatusOverrides((p) => ({ ...p, [id]: s }));
  }, []);

  const push = useCallback((s: CustomerScreen) => {
    setStack((t) => [...t, s]);
  }, []);

  const replace = useCallback((s: CustomerScreen) => {
    setStack((t) => [...t.slice(0, -1), s]);
  }, []);

  const pop = useCallback(() => {
    setStack((t) => (t.length > 1 ? t.slice(0, -1) : t));
  }, []);

  const goToMainTab = useCallback(
    (t: MainTab) => {
      if (session.kind === 'none') return;
      setMainTab(t);
      const screens: Record<MainTab, CustomerScreen> = {
        home: { name: 'home' },
        search: { name: 'search' },
        reservations: { name: 'my_reservations' },
        profile: { name: 'profile' },
      };
      setStack([screens[t]]);
    },
    [session.kind],
  );

  const enterAsGuest = useCallback(() => {
    setSession({ kind: 'guest' });
    setMainTab('home');
    setStack([{ name: 'home' }]);
  }, []);

  const setSessionFromLogin = useCallback(
    (u: { displayName: string; phone: string; city: string }) => {
      setSession({
        kind: 'user',
        user: { id: MOCK_U_ID, displayName: u.displayName, phone: u.phone, city: u.city },
        auth: 'mock',
      });
      setMainTab('home');
      setStack([{ name: 'home' }]);
    },
    [],
  );

  const setSessionFromVerify = useCallback(
    async (u: UserPublic, tokens: StoredAuthTokens) => {
      await saveTokens(tokens);
      setSession({ kind: 'user', user: toDisplayUserFromPublic(u), auth: 'api' });
      setMainTab('home');
      setStack([{ name: 'home' }]);
    },
    [],
  );

  const logout = useCallback(async () => {
    if (useApiAuth && api) {
      const t = await loadTokens();
      if (t?.accessToken) {
        try {
          await api.logout(t.accessToken, { sessionId: t.sessionId });
        } catch {
          /* local clear */
        }
      }
      await clearTokens();
    }
    setSession({ kind: 'none' });
    setLocalReservations([]);
    setStatusOverrides({});
    setStack([{ name: 'welcome' }]);
  }, [useApiAuth, api]);

  const addLocalReservation = useCallback((r: Reservation) => {
    setLocalReservations((p) => [...p, r]);
  }, []);

  const updateLocalReservation = useCallback((id: string, patch: Partial<Reservation>) => {
    setLocalReservations((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const v = useMemo(
    () =>
      ({
        session,
        authRestoring,
        useApiAuth,
        enterAsGuest,
        setSessionFromLogin,
        setSessionFromVerify,
        logout,
        localReservations,
        setLocalReservations,
        addLocalReservation,
        updateLocalReservation,
        mergedForCurrentCustomer,
        findReservation,
        statusOverrides,
        setStatusOverride,
        currentCustomerId,
        screen,
        stack,
        push,
        replace,
        pop,
        mainTab,
        setMainTab,
        goToMainTab,
      }) satisfies Ctx,
    [
      session,
      authRestoring,
      useApiAuth,
      enterAsGuest,
      setSessionFromLogin,
      setSessionFromVerify,
      logout,
      localReservations,
      addLocalReservation,
      updateLocalReservation,
      mergedForCurrentCustomer,
      findReservation,
      statusOverrides,
      setStatusOverride,
      currentCustomerId,
      screen,
      stack,
      push,
      replace,
      pop,
      mainTab,
      goToMainTab,
    ],
  );

  return <AppCtx.Provider value={v}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const x = useContext(AppCtx);
  if (!x) throw new Error('useApp');
  return x;
}

export function isMainAppScreen(
  n: CustomerScreen['name'],
): n is 'home' | 'search' | 'my_reservations' | 'profile' {
  return n === 'home' || n === 'search' || n === 'my_reservations' || n === 'profile';
}
