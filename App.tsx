import React from 'react';
import { Platform, StatusBar, YellowBox } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { Provider } from 'react-redux';

import { RootDrawer } from './src/navigation/RootDrawer';
import { store } from './src/store';
import { DataLoader } from './src/components/DataLoader';

// Innocuous warnings from ExpoKit (https://forums.expo.io/t/unable-to-ios-dev-menu-after-upgrading-to-sdk27-on-expokit/9883/10)
// TODO: Check back later
YellowBox.ignoreWarnings([
  'Class EXHomeModule',
  'Class EXTest',
  'Class EXDisabledDevMenu',
  'Class EXDisabledRedBox',
  'Class RCTCxxModule',
]);

const AppContainer = createAppContainer(RootDrawer);

const App = () => (
  <Provider store={store}>
    <StatusBar
      animated={false}
      barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
    />

    <DataLoader />

    <AppContainer />
  </Provider>
);

/* tslint:disable-next-line:no-default-export */
export default App;
/* tslint:enable */
