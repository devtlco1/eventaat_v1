import { Text, View } from 'react-native';
import { theme } from '../ui/theme';

export function FieldCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: theme.space.lg }}>
      <Text
        style={{
          color: theme.color.muted,
          fontSize: 12,
          marginBottom: 6,
          textAlign: 'right',
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}
