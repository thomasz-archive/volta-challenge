import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  NavigationScreenConfig,
  NavigationScreenOptions,
} from 'react-navigation';
import { connect } from 'react-redux';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { MAP_BOX_API } from '../values/secrets';
import { colors } from '../values/colors';
import { HORIZONTAL_SPACE, VERTICAL_SPACE } from '../values/constants';
import {
  Bound,
  VoltaSite,
} from '../values/types';
import { ReduxState } from '../reducers';
import { Annotation } from '../components/Annotation';
import { getVisibleSites } from '../utils/volta_utils';
import { InfoPane } from '../components/InfoPane';

MapboxGL.setAccessToken(MAP_BOX_API);

type Props = {
  sites: VoltaSite[],
};

type State = {
  bound?: Bound;
  currentSite?: VoltaSite,
  userLocation?: [number, number];
};

export class _MapScreen extends React.Component<Props, State> {
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
    bound: null,
    currentSite: null,
    userLocation: null,
  };

  map: MapboxGL.MapView;

  componentDidMount() {
    this.moveToUserLocation();
  }

  moveToUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        this.map.moveTo([longitude, latitude], 150);
        this.setState({ userLocation: [longitude, latitude] });
      },
      (error) => {
        console.log('error', error);
      }
    );
  };

  handleRegionDidChange = ({ properties }) => {
    const { visibleBounds } = properties;
    const [lng0, lat0] = visibleBounds[0];
    const [lng1, lat1] = visibleBounds[1];

    this.setState({
      bound: {
        lng0, lat0, lng1, lat1,
      }
    });
  };

  handleOnDismiss = () => {
    this.setState({ currentSite: null });
  };

  handleOnAnnotationPress = (site: VoltaSite) => {
    this.setState((prevState) => {
      const { currentSite } = prevState;
      const dismissCurrentSite = currentSite && currentSite.id === site.id;
      if (!dismissCurrentSite) this.map.moveTo(site.location.coordinates, 350);
      return {
        currentSite: dismissCurrentSite ? null : site,
      };
    });
  };

  render() {
    const { sites } = this.props;
    const { bound, currentSite, userLocation } = this.state;
    
    // const visibleSites = getVisibleSites(sites, bound);

    return (
      <View style={StyleSheet.absoluteFill}>
        <MapboxGL.MapView
          ref={(map: MapboxGL.MapView) => this.map = map}
          showUserLocation
          style={StyleSheet.absoluteFill}
          zoomLevel={11}
        >
          {sites.map((site) => (
            <Annotation
              key={site.id}
              coordinate={site.location.coordinates}
              onPress={this.handleOnAnnotationPress}
              site={site}
            />
          ))}
        </MapboxGL.MapView>

        {currentSite && (
          <InfoPane site={currentSite} />
        )}

        <TouchableWithoutFeedback onPress={this.moveToUserLocation}>
          <View style={styles.reCenterIconContainer}>
            <MaterialCommunityIcons
              name="navigation"
              size={24}
            />
          </View>
        </TouchableWithoutFeedback>
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerIcon: {
    color: `${colors.primary}`,
    marginHorizontal: HORIZONTAL_SPACE,
  },
  reCenterIconContainer: {
    alignItems: 'center',
    backgroundColor: `${colors.white}`,
    borderRadius: 20,
    justifyContent: 'center',
    position: 'absolute',
    height: 40,
    width: 40,
    top: 8,
    left: 8,
  },
});

export const MapScreen = (() => {
  const mapStateToProps = (state: ReduxState) => ({
    sites: state.sites,
  });

  const mapDispatchToProps = {};

  return connect(mapStateToProps, mapDispatchToProps)(_MapScreen);
})();

