import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  YellowBox,
} from 'react-native';

// Innocuous warnings from ExpoKit (https://forums.expo.io/t/unable-to-ios-dev-menu-after-upgrading-to-sdk27-on-expokit/9883/10)
// TODO: Check back later
YellowBox.ignoreWarnings(['Class EXHomeModule', 'Class EXTest', 'Class EXDisabledDevMenu', 'Class EXDisabledRedBox', 'Class RCTCxxModule']);

class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Volta Challenge</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/* tslint:disable-next-line:no-default-export */
export default App;
/* tslint:enable */
