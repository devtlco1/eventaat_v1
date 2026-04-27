/**
 * Mock restaurant scope for the web dashboard (Phase 1C). All IDs reference @eventaat/shared mock rows.
 * Code/IDs stay in English; UI labels are Arabic in arStrings.
 */
export const RESTAURANT_DEMO_ID = 'r_visible' as const;
/** Aligns with mock reservation dates in shared (prototype “today”) */
export const RESTAURANT_DEMO_TODAY = '2026-04-27' as const;

export function getDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function isReservationOnDate(iso: string, dateKey: string): boolean {
  return getDateKey(iso) === dateKey;
}
