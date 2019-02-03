import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  NavigationScreenConfig,
  NavigationScreenOptions,
} from 'react-navigation';
import { connect } from 'react-redux';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import SuperCluster from 'supercluster'

import { MAP_BOX_API } from '../values/secrets';
import { colors } from '../values/colors';
import { HORIZONTAL_SPACE } from '../values/constants';
import {
  GeoJSON,
  GeoJSONCollection,
  MapBoxOnChangeEvent,
  VoltaSite,
} from '../values/types';
import { ReduxState } from '../reducers';
import { SiteInfoPane } from '../components/SiteInfoPane';
import { Annotation } from '../components/Annotation';

MapboxGL.setAccessToken(MAP_BOX_API);

type ClusterParamsType = {
  bound: [number, number, number, number],
  zoom: number;
}

type Props = {
  sites: GeoJSONCollection,
};

type State = {
  bound?: [number, number, number, number];
  currentSite?: VoltaSite,
  data: GeoJSON[],
  zoom?: number,
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
    headerTitle:(
      <Image
        style={styles.headerLogo}
        resizeMode="contain"
        source={require('../../assets/volta_logo.png')}
      />
    ),
  });

  state = {
    bound: null,
    currentSite: null,
    data: [],
    zoom: 11,
  };

  cluster: SuperCluster;
  map: MapboxGL.MapView;
  _isInitialLoad = true;

  async componentDidMount() {
    this.moveToUserLocation();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.sites.features !== nextProps.sites.features) {
      this.clusterize(nextProps.sites.features);
    }
  }

  moveToUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        if (this._isInitialLoad && Platform.OS === 'android') {
          // TODO: Android (at least the emulator) seems to have issue 
          // zooming into user's location when the app first launches. 
          // Find a better solution later.
          this.map.setCamera({
            centerCoordinate: [longitude, latitude],
            zoom: 11,
            duration: 0,
          });
          this._isInitialLoad = false;
        } else {
          this.map.moveTo([longitude, latitude], 350);
        }

        this.setState({
          currentSite: null,
        }, () => {
          const { sites } = this.props;
          this.clusterize(sites.features);
        });
      },
      (error) => {
        console.log('error', error);
      }
    );
  };

  initializeCluster = () => {
    this.cluster = new SuperCluster({
      maxZoom: 14,
      initial: () => ({
        availableStations: 0,
        totalStations: 0,
      }),
      map: (properties: any) => ({
        availableStations: properties.chargers ? properties.chargers[0].available : 0,
        totalStations: properties.chargers ? properties.chargers[0].total : 0,
      }),
      reduce: (accumulated: any, properties: any) => {
        accumulated.availableStations += properties.availableStations;
        accumulated.totalStations += properties.totalStations;
      },
    });
  }

  clusterize = (data: GeoJSON[]) => {
    if (!this.cluster) this.initializeCluster();
    this.cluster.load(data);

    const { bound, zoom } = this.state;
    if (bound && zoom) {
      this.setState({
        data: this.getClusters({ bound, zoom }),
      });
    }
  };

  handleMapPress = () => {
    const { currentSite } = this.state;
    if (currentSite) this.setState({ currentSite: null });
  }

  getClusters = (params: ClusterParamsType) => (
    this.cluster.getClusters(params.bound, Math.floor(params.zoom))
  );

  handleDismiss = () => {
    this.setState({ currentSite: null });
  };

  handleRegionDidChange = (geo: GeoJSON) => {
    const properties = geo.properties as MapBoxOnChangeEvent;
    const visibleBounds = properties.visibleBounds;
    const zoomLevel = properties.zoomLevel;
    
    const params: ClusterParamsType = {
      bound: [visibleBounds[1][0], visibleBounds[1][1], visibleBounds[0][0], visibleBounds[0][1]],
      zoom: zoomLevel,
    };

    const { sites } = this.props;
    if (!this.cluster) this.initializeCluster();
    this.cluster.load(sites.features);

    const data = this.getClusters(params);
    this.setState({
      ...params,
      data,
    });
  }

  handleRegionPress = (geo: GeoJSON) => {
    const { geometry: { coordinates }, properties } = geo;
    const clusterId = properties['cluster_id'];
    const expansionZoom = this.cluster.getClusterExpansionZoom(clusterId);

    this.map.setCamera({
      centerCoordinate: coordinates,
      zoom: expansionZoom + 0.65, // add 0.65 to avoid clustering
      duration: 100,
    });
  }

  handleSingleSitePress = (geo: GeoJSON) => {
    const { geometry: { coordinates } } = geo;
    const properties = geo.properties as VoltaSite;
    const { id } = properties;

    this.setState((prevState) => {
      const { currentSite } = prevState;
      const dismissCurrentSite = currentSite && currentSite.id === id;
      if (!dismissCurrentSite) this.map.moveTo(coordinates, 350);

      return {
        currentSite: dismissCurrentSite ? null : properties,
      };
    });
  };

  render() {
    const { currentSite, data } = this.state;

    return (
      <View style={StyleSheet.absoluteFill}>
        <MapboxGL.MapView
          onPress={this.handleMapPress}
          onRegionDidChange={this.handleRegionDidChange}
          ref={(map: MapboxGL.MapView) => this.map = map}
          showUserLocation
          style={StyleSheet.absoluteFill}
          zoomLevel={11}
        >
          {data.map((d) => {
            const { geometry, properties } = d;
            const { coordinates } = geometry;

            const isRegion = !!properties['cluster_id'];

            if (isRegion) {
              const id = `REGION-${d.id}`;
              const available = properties.availableStations || 0;
              const total = properties.totalStations || 0;

              return (
                <Annotation
                  availableStations={available}
                  totalStations={total}
                  coordinate={coordinates}
                  id={id}
                  key={id}
                  onPress={this.handleRegionPress}
                  site={d}
                />
              );
            } else {
              const id = `SITE-${d.properties.id}`;
              const available = properties.chargers ? properties.chargers[0].available : 0;
              const total = properties.chargers ? properties.chargers[0].total : 0;

              return (
                <Annotation
                  availableStations={available}
                  totalStations={total}
                  coordinate={coordinates}
                  id={id}
                  isSite
                  key={id}
                  onPress={this.handleSingleSitePress}
                  site={d}
                />
              );
            }
          })}
        </MapboxGL.MapView>

        {currentSite && (
          <SiteInfoPane
            onDismiss={this.handleDismiss}
            site={currentSite}
          />
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
  headerLogo: {
    height: 30,
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

