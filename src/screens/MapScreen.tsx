import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Alert,
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
import { HORIZONTAL_SPACE } from '../values/constants';
import {
  VoltaSite,
  GeoJSonObject,
} from '../values/types';
import { ReduxState } from '../reducers';
import { InfoPane } from '../components/InfoPane';

MapboxGL.setAccessToken(MAP_BOX_API);

type Props = {
  sites: GeoJSonObject,
};

type State = {
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
        this.map.moveTo([longitude, latitude], 350);

        this.setState({
          currentSite: null,
          userLocation: [longitude, latitude]
        });
      },
      (error) => {
        console.log('error', error);
      }
    );
  };

  handleMapPress = () => {
    const { currentSite } = this.state;
    if (currentSite) this.setState({ currentSite: null });
  }

  handleDismiss = () => {
    this.setState({ currentSite: null });
  };

  handleShapePress = async (evt) => {
    const { payload } = evt.nativeEvent;
    const { properties } = payload;
    const isShowingSingleSite = (!properties['point_count'] || properties['point_count'] === 1);

    if (isShowingSingleSite) {
      this.handleSingleSitePress(properties);
    } else {
      const { geometry: { coordinates } } = payload;
      const currentZoom = await this.map.getZoom();

      this.map.setCamera({
        centerCoordinate: coordinates,
        zoom: currentZoom + 1.8,
        duration: 100,
      })
    }
  }

  handleSingleSitePress = (site: VoltaSite) => {
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
    const { currentSite } = this.state;
    
    return (
      <View style={StyleSheet.absoluteFill}>
        <MapboxGL.MapView
          onPress={this.handleMapPress}
          ref={(map: MapboxGL.MapView) => this.map = map}
          showUserLocation
          style={StyleSheet.absoluteFill}
          zoomLevel={11}
        >
          <MapboxGL.ShapeSource
            id="sites"
            cluster
            clusterRadius={8}
            clusterMaxZoom={14}
            onPress={this.handleShapePress}
            shape={sites}
          >
            <MapboxGL.SymbolLayer
              id="pointCount"
              style={mapboxStyles.clusterCount}
            />

            <MapboxGL.CircleLayer
              id="clusteredPoints"
              belowLayerID="pointCount"
              filter={['has', 'point_count']}
              style={mapboxStyles.clusteredPoints}
            />

            <MapboxGL.CircleLayer
              id="singlePoint"
              filter={['!has', 'point_count']}
              style={mapboxStyles.singlePoint}
            />            
          </MapboxGL.ShapeSource>
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

const mapboxStyles = MapboxGL.StyleSheet.create({
  singlePoint: {
    textColor: `${colors.white}`,
    textField: '{point_count}',
    circleColor: `${colors.secondary}`,
    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
    circleRadius: 15,
    circlePitchAlignment: 'map',
  },

  clusteredPoints: {
    circlePitchAlignment: 'map',
    circleColor: `${colors.black}`,
    circleRadius: MapboxGL.StyleSheet.source(
      [[0, 15], [100, 20], [750, 30]],
      'point_count',
      MapboxGL.InterpolationMode.Exponential,
    ),
    circleOpacity: 0.84,
  },

  clusterCount: {
    textColor: `${colors.white}`,
    textField: '{point_count}',
    textPitchAlignment: 'map',
    textSize: 14,
  },
});

export const MapScreen = (() => {
  const mapStateToProps = (state: ReduxState) => ({
    sites: state.sites,
  });

  const mapDispatchToProps = {};

  return connect(mapStateToProps, mapDispatchToProps)(_MapScreen);
})();

