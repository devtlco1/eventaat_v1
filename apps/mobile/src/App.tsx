import { StatusBar } from 'expo-status-bar';
import { ScreenRouter } from './ScreenRouter';
import { AppProvider } from './state/AppContext';

export function App() {
  return (
    <AppProvider>
      <ScreenRouter />
      <StatusBar style="light" />
    </AppProvider>
  );
}
