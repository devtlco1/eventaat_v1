'use client';

import { USER_ROLE_LABELS_AR, UserRole } from '@eventaat/shared';
import { ar } from '@/lib/arStrings';
import type { MockRestaurantRole } from '@/context/RestaurantDashboardContext';
import { useRestaurantDashboard } from '@/context/RestaurantDashboardContext';
import styles from './restaurant.module.css';

const OPTIONS: MockRestaurantRole[] = [
  UserRole.restaurant_owner,
  UserRole.branch_manager,
  UserRole.restaurant_host,
];

export function RestaurantRoleBar() {
  const { role, setRole } = useRestaurantDashboard();
  return (
    <div className={styles.roleBar}>
      <div>
        <div className={styles.muted} style={{ fontSize: '0.8rem' }}>
          {ar.shell.restaurantAreaTitle}
        </div>
        <div style={{ fontSize: '0.85rem', marginTop: 4 }}>{ar.role.label}</div>
      </div>
      <div>
        <label htmlFor="r-role" className={styles.sLabel}>
          {' '}
        </label>
        <select
          id="r-role"
          className={styles.roleSelect}
          value={role}
          onChange={(e) => setRole(e.target.value as MockRestaurantRole)}
        >
          {OPTIONS.map((k) => (
            <option key={k} value={k}>
              {USER_ROLE_LABELS_AR[k]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
