import { I18nManager } from 'react-native';
import { registerRootComponent } from 'expo';
import { App } from './src/App';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

registerRootComponent(App);
