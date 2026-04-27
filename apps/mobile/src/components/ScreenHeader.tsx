import { Pressable, Text, View } from 'react-native';
import { theme } from '../ui/theme';

export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.space.lg,
        minHeight: 40,
      }}
    >
      <View style={{ flex: 1, alignItems: 'flex-start' }}>{right}</View>
      <Text
        style={{
          flex: 2,
          textAlign: 'center',
          color: theme.color.text,
          fontSize: 18,
          fontWeight: '700',
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={8}>
            <Text style={{ color: theme.color.accent2, fontSize: 15, fontWeight: '600' }}>رجوع</Text>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
    </View>
  );
}
