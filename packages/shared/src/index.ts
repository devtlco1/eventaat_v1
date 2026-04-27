/**
 * @eventaat/shared — types, domain constants, and mock-first data (Phase 1A).
 * UI layers import from this package; do not duplicate records in app components.
 */
export const APP_NAME = 'eventaat' as const;
export type AppName = typeof APP_NAME;

export * from './constants/index.js';
export * from './types/index.js';
export * from './mock/index.js';
export * from './auth-client/index.js';
export * from './rbac/index.js';
