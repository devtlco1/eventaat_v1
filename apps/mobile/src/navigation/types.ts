import type { Reservation } from '@eventaat/shared';

export type MainTab = 'home' | 'search' | 'reservations' | 'profile';

export type CustomerScreen =
  | { name: 'welcome' }
  | { name: 'login' }
  | { name: 'register_login' }
  | {
      name: 'otp';
      phone: string;
      next: 'login' | 'register';
      /** Use `mock` for legacy UI-only flow */
      challengeId: string;
      devOtp?: string;
    }
  | { name: 'register_profile'; phone: string }
  | { name: 'home' }
  | { name: 'search'; initialQuery?: string }
  | { name: 'restaurant'; id: string }
  | { name: 'create_reservation'; id: string }
  | { name: 'reservation_pending'; res: Reservation }
  | { name: 'my_reservations' }
  | { name: 'reservation_detail'; id: string }
  | { name: 'profile' }
  | { name: 'support' };
