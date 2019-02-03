import React from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Constants } from 'expo';
import {
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
};

type State = {
  
};

export class SettingsScreen extends React.Component<Props, State> {
  handleBackPress = () => {
    const { navigation: { goBack } } = this.props;
    goBack();
  };

  render() {
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={this.handleBackPress}>
          <Text>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

const statusBarHeight = (Platform.OS === 'ios' && Number(Platform.Version) >= 11
  ? 0
  : Constants.statusBarHeight
);

const styles = StyleSheet.create({
  safeAreaView: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: statusBarHeight,
  },
});
