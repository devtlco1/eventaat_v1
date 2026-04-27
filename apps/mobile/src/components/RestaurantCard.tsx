import { Pressable, Text, View } from 'react-native';
import type { Restaurant } from '@eventaat/shared';
import { RESTAURANT_STATUS_LABELS_AR } from '@eventaat/shared';
import { theme } from '../ui/theme';

export function RestaurantCard({ r, onPress }: { r: Restaurant; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: theme.color.card,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.color.line,
          padding: theme.space.lg,
          marginBottom: theme.space.md,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View
        style={{
          height: 100,
          borderRadius: theme.radius.sm,
          backgroundColor: 'rgba(16,185,129,0.12)',
          marginBottom: theme.space.md,
        }}
      />
      <Text style={{ color: theme.color.text, fontSize: 17, fontWeight: '700', textAlign: 'right' }}>
        {r.name}
      </Text>
      <Text style={{ color: theme.color.muted, marginTop: 4, textAlign: 'right', fontSize: 13 }}>
        {r.cuisineTypeAr} · {r.area}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: theme.space.sm,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: theme.color.accent2, fontSize: 13, fontWeight: '600' }}>
          ★ {r.ratingMock.toFixed(1)}
        </Text>
        <Text style={{ color: theme.color.dim, fontSize: 11 }}>{RESTAURANT_STATUS_LABELS_AR[r.status]}</Text>
      </View>
    </Pressable>
  );
}
