'use client';

import { RestaurantDashboardProvider } from '@/context/RestaurantDashboardContext';
import { RestaurantRoleBar } from '@/components/restaurant/RestaurantRoleBar';
import { RestaurantToasts } from '@/components/restaurant/RestaurantToasts';

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  return (
    <RestaurantDashboardProvider>
      <RestaurantRoleBar />
      {children}
      <RestaurantToasts />
    </RestaurantDashboardProvider>
  );
}
