import { SafeAreaView, View, type ViewProps } from 'react-native';
import { theme } from '../ui/theme';

export function AppShell({ children, style, ...r }: ViewProps) {
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.color.bg }]}>
      <View style={[{ flex: 1, paddingHorizontal: theme.space.lg, paddingTop: theme.space.md }, style]} {...r}>
        {children}
      </View>
    </SafeAreaView>
  );
}
