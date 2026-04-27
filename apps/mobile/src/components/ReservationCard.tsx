import { Pressable, Text, View } from 'react-native';
import type { Reservation } from '@eventaat/shared';
import { RESERVATION_STATUS_LABELS_AR } from '@eventaat/shared';
import { theme } from '../ui/theme';
import { StatusBadge } from './StatusBadge';

export function ReservationCard({
  res,
  title,
  onPress,
}: {
  res: Reservation;
  title: string;
  onPress: () => void;
}) {
  const d = new Date(res.scheduledAt);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: theme.color.card,
          borderWidth: 1,
          borderColor: theme.color.line,
          borderRadius: theme.radius.md,
          padding: theme.space.lg,
          marginBottom: theme.space.md,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={{ color: theme.color.text, fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
            {title}
          </Text>
          <Text style={{ color: theme.color.muted, fontSize: 12, marginTop: 4 }}>
            {d.toLocaleDateString('ar-IQ')} {d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })} —{' '}
            {res.partySize} أشخاص
          </Text>
        </View>
        <View style={{ marginStart: 8, alignItems: 'flex-end' }}>
          <StatusBadge status={res.status} />
          <Text style={{ color: theme.color.dim, fontSize: 11, marginTop: 6 }}>{res.refCode}</Text>
        </View>
      </View>
    </Pressable>
  );
}
