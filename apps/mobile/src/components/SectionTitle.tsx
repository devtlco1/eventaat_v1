import { Text, View } from 'react-native';
import { theme } from '../ui/theme';

export function SectionTitle({ children }: { children: string }) {
  return (
    <View style={{ marginBottom: theme.space.md, marginTop: theme.space.lg }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: theme.color.text,
          textAlign: 'right',
        }}
      >
        {children}
      </Text>
    </View>
  );
}
