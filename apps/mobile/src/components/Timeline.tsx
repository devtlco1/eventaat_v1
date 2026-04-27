import { Text, View } from 'react-native';
import type { ReservationStatus } from '@eventaat/shared';
import { activeTimelineIndex, isCancelledLike, TIMELINE } from '../utils/timeline';
import { theme } from '../ui/theme';

export function Timeline({ status }: { status: ReservationStatus }) {
  if (isCancelledLike(status)) {
    return (
      <View style={{ marginTop: theme.space.lg }}>
        <Text style={{ color: theme.color.muted, textAlign: 'right' }}>
          الحالة الحالية: لا ينطبق المسار الكامل لأن الحجز أُلغي أو اكتمل بشكل حازم. راجع تفاصيل أعلاه.
        </Text>
      </View>
    );
  }

  const idx = activeTimelineIndex(status);
  return (
    <View style={{ marginTop: theme.space.lg }}>
      {TIMELINE.map((s, i) => {
        const done = idx >= 0 && i < idx;
        const current = i === idx;
        return (
          <View
            key={s.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
              justifyContent: 'flex-end',
            }}
          >
            <Text
              style={{
                color: current ? theme.color.text : done ? theme.color.muted : theme.color.dim,
                fontWeight: current ? '700' : '400',
                fontSize: 14,
                textAlign: 'right',
                flex: 1,
              }}
            >
              {s.label}
            </Text>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: done || current ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.08)',
                borderWidth: current ? 2 : 0,
                borderColor: theme.color.accent,
                marginStart: 10,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}
