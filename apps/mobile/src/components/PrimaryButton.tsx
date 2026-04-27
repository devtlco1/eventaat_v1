import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../ui/theme';

export function PrimaryButton({
  label,
  onPress,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: disabled ? theme.color.dim : theme.color.accent,
          paddingVertical: 14,
          borderRadius: theme.radius.md,
          alignItems: 'center',
          opacity: pressed && !disabled ? 0.9 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: '#f0fdf4', fontWeight: '600', fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}
