import { StyleSheet } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { colors } from '../values/colors';

import { MapScreen } from '../screens/MapScreen';

export const MapModal = createStackNavigator({
  Map: {
    screen: MapScreen,
  },
}, {
  initialRouteName: 'Map',
  mode: 'modal',
  navigationOptions: {
    headerStyle: {
      backgroundColor: `${colors.white}`,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerTintColor: `${colors.primary}`,
  },
});