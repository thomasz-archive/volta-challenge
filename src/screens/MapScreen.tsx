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
import { Supercluster, Cluster } from 'supercluster'
import {
  Feature,
  GeoJsonProperties,
  Point,
} from 'geojson';

import { MAP_BOX_API } from '../values/secrets';
import { colors } from '../values/colors';
import { HORIZONTAL_SPACE } from '../values/constants';
import {
  Bound,
  GeoJSONCollection,
  MapBoxOnChangeEvent,
  VoltaSite,
} from '../values/types';
import { ReduxState } from '../reducers';
import { SiteInfoPane } from '../components/SiteInfoPane';
import { Annotation } from '../components/Annotation';
import { supercluster } from '../utils/supercluster';

MapboxGL.setAccessToken(MAP_BOX_API);

const DEFAULT_ZOOM_LEVEL = 11;

type ClusterParamsType = {
  bound: Bound,
  zoom: number;
}

type Props = {
  sites: GeoJSONCollection,
};

type State = {
  bound?: Bound; // [westLng, southLat, eastLng, northLat]
  currentSite?: VoltaSite,
  data: Cluster[],
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
      <View style={styles.headerLogoContainer}> 
        <Image
          style={styles.headerLogo}
          resizeMode="contain"
          source={require('../../assets/volta_logo.png')}
        />
      </View>
    ),
    headerRight: (<View />),
  });

  state = {
    bound: null,
    currentSite: null,
    data: [],
    zoom: 11,
  };

  cluster: Supercluster;
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
            zoom: DEFAULT_ZOOM_LEVEL,
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

  clusterize = (data: Feature<Point, GeoJsonProperties>[]) => {
    if (!this.cluster) this.cluster = supercluster.init();
    this.cluster.load(data);

    const { bound, zoom } = this.state;
    if (bound && zoom) {
      this.setState({
        data: this.getClusters({ bound, zoom }),
      });
    }
  };

  getClusters = (params: ClusterParamsType) => (
    // zoom accepts an integer
    this.cluster.getClusters(params.bound, Math.floor(params.zoom))
  );

  handleRegionDidChange = (geo: Feature<Point, GeoJsonProperties>) => {
    const properties = geo.properties as MapBoxOnChangeEvent;
    const visibleBounds = properties.visibleBounds;
    const zoomLevel = properties.zoomLevel;
    
    const params: ClusterParamsType = {
      bound: [visibleBounds[1][0], visibleBounds[1][1], visibleBounds[0][0], visibleBounds[0][1]],
      zoom: zoomLevel,
    };

    const { sites: { features } } = this.props;
    if (!this.cluster) this.cluster = supercluster.init();
    this.cluster.load(features);

    const data = this.getClusters(params);
    this.setState({
      ...params,
      data,
    });
  };

  handleRegionPress = (geo: Feature<Point, GeoJsonProperties>) => {
    const { geometry: { coordinates }, properties } = geo;
    const clusterId = properties['cluster_id'];
    // @ts-ignore - getClusterExpansionZoom doesn't accept second parameter per docs
    const expansionZoom = this.cluster.getClusterExpansionZoom(clusterId);

    this.map.setCamera({
      centerCoordinate: coordinates,
      zoom: expansionZoom + 0.7, // add 0.7 to avoid clustering
      duration: 100,
    });
  };

  handleSingleSitePress = (geo: Feature<Point, GeoJsonProperties>) => {
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

  handleDismiss = () => {
    this.setState({ currentSite: null });
  };

  renderAnnotation = (dataPoint: Cluster) => {
    const { geometry, properties } = dataPoint;
    const isCluster = !!properties['cluster_id'];
    let id: string, available: number, total: number, 
      onPress: (geo: Feature<Point, GeoJsonProperties>) => void;

    if (isCluster) {
      id = `REGION-${dataPoint.id}`;
      available = properties.availableStations || 0;
      total = properties.totalStations || 0;
      onPress = this.handleRegionPress;
    } else {
      id = `SITE-${properties.id}`;
      available = properties.chargers ? properties.chargers[0].available : 0;
      total = properties.chargers ? properties.chargers[0].total : 0;
      onPress = this.handleSingleSitePress;
    }

    const { coordinates } = geometry;
    return (
      <Annotation
        availableStations={available}
        totalStations={total}
        coordinate={coordinates}
        id={id}
        isSite={!isCluster}
        key={id}
        onPress={onPress}
        site={dataPoint}
      />
    );
  };
  
  render() {
    const { currentSite, data } = this.state;

    return (
      <View style={StyleSheet.absoluteFill}>
        {/*
          onPress prop of MapView doesn't work so well when there's an overlay on top 
          (it requires two touches to active the touch event).
        */}
        <TouchableWithoutFeedback onPress={this.handleDismiss} style={StyleSheet.absoluteFill}>
          <MapboxGL.MapView
            onRegionDidChange={this.handleRegionDidChange}
            ref={(map: MapboxGL.MapView) => this.map = map}
            showUserLocation
            style={StyleSheet.absoluteFill}
            zoomLevel={DEFAULT_ZOOM_LEVEL}
          >
            {data.map(this.renderAnnotation)}
          </MapboxGL.MapView>
        </TouchableWithoutFeedback>

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
  headerLogoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
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
    left: 8,
    top: 8,
  },
});

export const MapScreen = (() => {
  const mapStateToProps = (state: ReduxState) => ({
    sites: state.sites,
  });

  const mapDispatchToProps = {};

  return connect(mapStateToProps, mapDispatchToProps)(_MapScreen);
})();

