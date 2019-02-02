import React from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  YellowBox,
} from 'react-native';
import { Constants } from 'expo';
import { createAppContainer } from 'react-navigation';

import { RootDrawer } from './src/navigation/RootDrawer';

// Innocuous warnings from ExpoKit (https://forums.expo.io/t/unable-to-ios-dev-menu-after-upgrading-to-sdk27-on-expokit/9883/10)
// TODO: Check back later
YellowBox.ignoreWarnings(['Class EXHomeModule', 'Class EXTest', 'Class EXDisabledDevMenu', 'Class EXDisabledRedBox', 'Class RCTCxxModule']);

const AppContainer = createAppContainer(RootDrawer);

class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          animated={false}
          barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        />

        <AppContainer />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

/* tslint:disable-next-line:no-default-export */
export default App;
/* tslint:enable */
