import { Pressable, Text, View } from 'react-native';
import type { MainTab } from '../navigation/types';
import { theme } from '../ui/theme';

const TABS: { k: MainTab; label: string; icon: string }[] = [
  { k: 'home', label: 'الرئيسية', icon: '⌂' },
  { k: 'search', label: 'بحث', icon: '⌕' },
  { k: 'reservations', label: 'حجوزاتي', icon: '☰' },
  { k: 'profile', label: 'حسابي', icon: '◎' },
];

export function BottomNav({ active, onChange }: { active: MainTab; onChange: (k: MainTab) => void }) {
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: theme.color.line,
        paddingTop: 8,
        paddingBottom: 4,
        flexDirection: 'row',
        backgroundColor: theme.color.bg,
        justifyContent: 'space-around',
      }}
    >
      {TABS.map((t) => {
        const on = active === t.k;
        return (
          <Pressable key={t.k} onPress={() => onChange(t.k)} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: on ? theme.color.accent2 : theme.color.dim }}>{t.icon}</Text>
            <Text
              style={{
                fontSize: 10,
                marginTop: 2,
                color: on ? theme.color.text : theme.color.muted,
                fontWeight: on ? '600' : '400',
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
