import { View } from 'react-native';
import { BottomNav } from './components/BottomNav';
import { isMainAppScreen, useApp } from './state/AppContext';
import { theme } from './ui/theme';
import {
  LoginScreen,
  OtpScreen,
  RegisterLoginScreen,
  RegisterProfileScreen,
  WelcomeScreen,
} from './screens/AuthScreens';
import { HomeScreen } from './screens/HomeScreen';
import { SearchScreen } from './screens/SearchScreen';
import {
  CreateReservationScreen,
  ReservationPendingScreen,
  RestaurantDetailsScreen,
} from './screens/RestaurantScreens';
import { MyReservationsScreen, ReservationDetailsScreen } from './screens/ReservationsScreens';
import { ProfileScreen, SupportScreen } from './screens/ProfileScreens';

export function ScreenRouter() {
  const { screen, session, mainTab, goToMainTab } = useApp();
  const showNav = session.kind !== 'none' && isMainAppScreen(screen.name);

  const body = (() => {
    switch (screen.name) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'login':
        return <LoginScreen />;
      case 'register_login':
        return <RegisterLoginScreen />;
      case 'otp':
        return <OtpScreen next={screen.next} phone={screen.phone} />;
      case 'register_profile':
        return <RegisterProfileScreen phone={screen.phone} />;
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen initialQuery={screen.initialQuery} />;
      case 'restaurant':
        return <RestaurantDetailsScreen id={screen.id} />;
      case 'create_reservation':
        return <CreateReservationScreen id={screen.id} />;
      case 'reservation_pending':
        return <ReservationPendingScreen res={screen.res} />;
      case 'my_reservations':
        return <MyReservationsScreen />;
      case 'reservation_detail':
        return <ReservationDetailsScreen id={screen.id} />;
      case 'profile':
        return <ProfileScreen />;
      case 'support':
        return <SupportScreen />;
    }
  })();
  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      {body}
      {showNav ? <BottomNav active={mainTab} onChange={goToMainTab} /> : null}
    </View>
  );
}
