import { Text, View } from 'react-native';
import { theme } from '../ui/theme';

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View
      style={{
        padding: theme.space.xl,
        alignItems: 'center',
        backgroundColor: theme.color.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.color.line,
        marginTop: theme.space.lg,
      }}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: '600',
          color: theme.color.text,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: theme.color.muted,
          textAlign: 'center',
          marginTop: theme.space.sm,
          lineHeight: 20,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
