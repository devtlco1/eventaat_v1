import { Text, TextInput, type TextInputProps, View } from 'react-native';
import { theme } from '../ui/theme';

export function TextField(
  props: TextInputProps & { label?: string; value: string; onChangeText: (t: string) => void },
) {
  const { label, style, ...rest } = props;
  return (
    <View>
      {label ? (
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
      ) : null}
      <TextInput
        placeholderTextColor={theme.color.dim}
        style={[
          {
            backgroundColor: theme.color.surface,
            borderWidth: 1,
            borderColor: theme.color.line,
            borderRadius: theme.radius.md,
            padding: 12,
            color: theme.color.text,
            textAlign: 'right',
            fontSize: 16,
            minHeight: props.multiline ? 88 : undefined,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}
