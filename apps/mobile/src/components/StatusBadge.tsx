import { Text, View } from 'react-native';
import type { ReservationStatus } from '@eventaat/shared';
import { RESERVATION_STATUS_LABELS_AR } from '@eventaat/shared';
import { theme } from '../ui/theme';

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderRadius: theme.radius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.35)',
      }}
    >
      <Text style={{ color: theme.color.accent2, fontSize: 12, fontWeight: '600' }}>
        {RESERVATION_STATUS_LABELS_AR[status]}
      </Text>
    </View>
  );
}
