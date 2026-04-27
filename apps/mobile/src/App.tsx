import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { APP_NAME } from '@eventaat/shared';

export function App() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>مرحباً بك في {APP_NAME}</Text>
      <Text style={styles.subtitle}>
        تطبيق حجز طاولات — هذه شاشة ترحيب مبدئية؛ الميزات ستُبنى حسب الـ Product Blueprint.
      </Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#f9fafb',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },
});
