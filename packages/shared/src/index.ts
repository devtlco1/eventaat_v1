/**
 * @eventaat/shared — types, domain constants, and mock-first data (Phase 1A).
 * UI layers import from this package; do not duplicate records in app components.
 */
export const APP_NAME = 'eventaat' as const;
export type AppName = typeof APP_NAME;

export * from './constants';
export * from './types';
export * from './mock';
