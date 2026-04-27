export type CustomerScreen =
  | { name: 'welcome' }
  | { name: 'home' }
  | { name: 'search' }
  | { name: 'restaurant'; restaurantId: string }
  | { name: 'create_reservation'; restaurantId: string }
  | { name: 'my_reservations' }
  | { name: 'reservation_detail'; reservationId: string }
  | { name: 'profile' };
