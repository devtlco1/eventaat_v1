'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Branch, Reservation, Restaurant, RestaurantTable } from '@eventaat/shared';
import { mockBranches, mockReservations, mockRestaurants, mockTables, mockUsers, UserRole } from '@eventaat/shared';
import { RESTAURANT_DEMO_ID } from '@/lib/restaurantConfig';

export type MockRestaurantRole =
  | typeof UserRole.restaurant_owner
  | typeof UserRole.branch_manager
  | typeof UserRole.restaurant_host;

type BranchUiState = {
  status: 'open' | 'closed' | 'temp_closed' | 'bookings_off';
};

type Ctx = {
  restaurant: Restaurant;
  branches: Branch[];
  baseReservations: Reservation[];
  baseTables: RestaurantTable[];
  /** Current staff role (UI-only) */
  role: MockRestaurantRole;
  setRole: (r: MockRestaurantRole) => void;
  branchUi: Record<string, BranchUiState>;
  setBranchStatus: (branchId: string, status: BranchUiState['status']) => void;
  /** UI-only table patches by id */
  tablePatch: Record<string, Partial<RestaurantTable>>;
  patchTable: (id: string, patch: Partial<RestaurantTable>) => void;
  /** UI-only reservation overrides by id */
  resPatch: Record<string, Partial<Reservation>>;
  patchReservation: (id: string, patch: Partial<Reservation>) => void;
  usersById: Map<string, (typeof mockUsers)[0]>;
  getMergedReservations: () => Reservation[];
  getMergedTables: () => RestaurantTable[];
  toasts: { id: string; text: string }[];
  pushToast: (text: string) => void;
  dismissToast: (id: string) => void;
};

const C = createContext<Ctx | null>(null);

const initialBranchUi = (): Record<string, BranchUiState> => {
  const o: Record<string, BranchUiState> = {};
  for (const b of mockBranches) {
    if (b.restaurantId === RESTAURANT_DEMO_ID) o[b.id] = { status: 'open' };
  }
  return o;
};

export function RestaurantDashboardProvider({ children }: { children: React.ReactNode }) {
  const restaurant = mockRestaurants.find((r) => r.id === RESTAURANT_DEMO_ID)!;
  const branches = useMemo(
    () => mockBranches.filter((b) => b.restaurantId === RESTAURANT_DEMO_ID),
    [],
  );
  const baseReservations = useMemo(
    () => mockReservations.filter((r) => r.restaurantId === RESTAURANT_DEMO_ID),
    [],
  );
  const branchIds = useMemo(() => new Set(branches.map((b) => b.id)), [branches]);
  const baseTables = useMemo(
    () => mockTables.filter((t) => branchIds.has(t.branchId)),
    [branchIds],
  );

  const [role, setRole] = useState<MockRestaurantRole>(UserRole.restaurant_owner);
  const [branchUi, setBranchUi] = useState<Record<string, BranchUiState>>(initialBranchUi);
  const [tablePatch, setTablePatch] = useState<Record<string, Partial<RestaurantTable>>>({});
  const [resPatch, setResPatch] = useState<Record<string, Partial<Reservation>>>({});
  const [toasts, setToasts] = useState<{ id: string; text: string }[]>([]);

  const usersById = useMemo(() => new Map(mockUsers.map((u) => [u.id, u])), []);

  const pushToast = useCallback((text: string) => {
    const id = `t_${Date.now()}`;
    setToasts((p) => [...p, { id, text }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const patchTable = useCallback((id: string, patch: Partial<RestaurantTable>) => {
    setTablePatch((p) => ({ ...p, [id]: { ...p[id], ...patch } }));
  }, []);

  const patchReservation = useCallback((id: string, patch: Partial<Reservation>) => {
    setResPatch((p) => ({ ...p, [id]: { ...p[id], ...patch } }));
  }, []);

  const setBranchStatus = useCallback((branchId: string, status: BranchUiState['status']) => {
    setBranchUi((p) => ({ ...p, [branchId]: { status } }));
  }, []);

  const getMergedReservations = useCallback((): Reservation[] => {
    return baseReservations.map((r) => (resPatch[r.id] ? { ...r, ...resPatch[r.id] } : { ...r }));
  }, [baseReservations, resPatch]);

  const getMergedTables = useCallback((): RestaurantTable[] => {
    return baseTables.map((t) => (tablePatch[t.id] ? { ...t, ...tablePatch[t.id] } : { ...t }));
  }, [baseTables, tablePatch]);

  const v = useMemo<Ctx>(
    () => ({
      restaurant,
      branches,
      baseReservations,
      baseTables,
      role,
      setRole,
      branchUi,
      setBranchStatus,
      tablePatch,
      patchTable,
      resPatch,
      patchReservation,
      usersById,
      getMergedReservations,
      getMergedTables,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      restaurant,
      branches,
      baseReservations,
      baseTables,
      role,
      setRole,
      branchUi,
      tablePatch,
      resPatch,
      usersById,
      getMergedReservations,
      getMergedTables,
      toasts,
      pushToast,
      dismissToast,
      setBranchStatus,
      patchTable,
      patchReservation,
    ],
  );

  return <C.Provider value={v}>{children}</C.Provider>;
}

export function useRestaurantDashboard() {
  const x = useContext(C);
  if (!x) throw new Error('useRestaurantDashboard must be used under RestaurantDashboardProvider');
  return x;
}

export { isTodayReservation, isLateReservation, isNoShowCandidate, timeLabel } from '@/lib/reservationMetrics';
export { isReservationOnDate, getDateKey, RESTAURANT_DEMO_TODAY } from '@/lib/restaurantConfig';
