import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  NavigationScreenConfig,
  NavigationScreenOptions,
} from 'react-navigation';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { MAP_BOX_API } from '../values/secrets';
import { colors } from '../values/colors';
import { Coordinates } from '../values/types';
import { HORIZONTAL_SPACE } from '../values/constants';

MapboxGL.setAccessToken(MAP_BOX_API);

type Props = {
  
};

type State = {
  userLocation?: [number, number];
};

export class MapScreen extends React.Component<Props, State> {
  static navigationOptions: NavigationScreenConfig<NavigationScreenOptions> = ({ navigation }) => ({
    headerLeft: (
      <MaterialCommunityIcons
        name="menu"
        size={24}
        style={styles.headerIcon}
        onPress={() => navigation.toggleDrawer()}
      />
    ),
    title: 'Volta',
  });

  state = {
    userLocation: null,
  };

  componentDidMount() {
    this.getLocation();

    // load stations
  }

  getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        this.setState({ userLocation: [longitude, latitude] });
      },
      (error) => {
        // TODO: address this later
        console.log('error', error);
      }
    );
  };

  render() {
    const { userLocation } = this.state;

    return (
      <View style={StyleSheet.absoluteFill}>
        <MapboxGL.MapView
          centerCoordinate={userLocation}
          showUserLocation
          style={StyleSheet.absoluteFill}
          zoomLevel={11}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerIcon: {
    color: `${colors.primary}`,
    marginHorizontal: HORIZONTAL_SPACE,
  },
});
