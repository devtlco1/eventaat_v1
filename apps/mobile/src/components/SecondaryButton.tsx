import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../ui/theme';

export function SecondaryButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          borderWidth: 1,
          borderColor: theme.color.line,
          paddingVertical: 12,
          borderRadius: theme.radius.md,
          alignItems: 'center',
          backgroundColor: pressed ? 'rgba(255,255,255,0.04)' : 'transparent',
        },
        style,
      ]}
    >
      <Text style={{ color: theme.color.text, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
