import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockReservations, type Reservation } from '@eventaat/shared';
import type { CustomerScreen, MainTab } from '../navigation/types';
import {
  findReservationById,
  GUEST_CUSTOMER_ID,
  mergeCustomerReservations,
} from '../utils/reservations';

type SessionState =
  | { kind: 'none' }
  | { kind: 'guest' }
  | { kind: 'user'; user: { id: string; displayName: string; phone: string; city: string } };

type Ctx = {
  session: SessionState;
  /** Guest session + navigate to home (one atomic action for the welcome screen). */
  enterAsGuest: () => void;
  setSessionFromLogin: (u: { displayName: string; phone: string; city: string }) => void;
  logout: () => void;
  localReservations: Reservation[];
  setLocalReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  addLocalReservation: (r: Reservation) => void;
  updateLocalReservation: (id: string, patch: Partial<Reservation>) => void;
  mergedForCurrentCustomer: () => Reservation[];
  findReservation: (id: string) => Reservation | undefined;
  /** Prototype UI-only status changes (mock or local ids) */
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionState>({ kind: 'none' });
  const [localReservations, setLocalReservations] = useState<Reservation[]>([]);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Reservation['status']>>({});
  const [stack, setStack] = useState<CustomerScreen[]>([{ name: 'welcome' }]);
  const [mainTab, setMainTab] = useState<MainTab>('home');

  const screen = stack[stack.length - 1]!;

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
        user: { id: 'u_c1', displayName: u.displayName, phone: u.phone, city: u.city },
      });
      setMainTab('home');
      setStack([{ name: 'home' }]);
    },
    [],
  );

  const logout = useCallback(() => {
    setSession({ kind: 'none' });
    setLocalReservations([]);
    setStatusOverrides({});
    setStack([{ name: 'welcome' }]);
  }, []);

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
        enterAsGuest,
        setSessionFromLogin,
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
      enterAsGuest,
      setSessionFromLogin,
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

export function isMainAppScreen(n: CustomerScreen['name']): n is 'home' | 'search' | 'my_reservations' | 'profile' {
  return n === 'home' || n === 'search' || n === 'my_reservations' || n === 'profile';
}
