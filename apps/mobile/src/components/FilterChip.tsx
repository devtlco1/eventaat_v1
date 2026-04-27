import { Pressable, Text } from 'react-native';
import { theme } from '../ui/theme';

export function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? 'rgba(16, 185, 129, 0.2)' : theme.color.card,
        borderColor: active ? theme.color.accent : theme.color.line,
        borderWidth: 1,
        borderRadius: theme.radius.full,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginEnd: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: active ? theme.color.accent2 : theme.color.muted, fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}
