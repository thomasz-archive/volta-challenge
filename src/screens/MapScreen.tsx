import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  PixelRatio,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  NavigationScreenConfig,
  NavigationScreenOptions,
  NavigationScreenProp,
  NavigationState,
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
import { strings } from '../values/strings';
import { HORIZONTAL_SPACE } from '../values/constants';
import {
  Bound,
  GeoJSONCollection,
  MapBoxOnChangeEvent,
  VoltaSite,
  CitiesResponse,
} from '../values/types';
import { ReduxState } from '../reducers';
import { SiteInfoPane } from '../components/SiteInfoPane';
import { Annotation } from '../components/Annotation';
import { supercluster } from '../utils/supercluster';
import { SearchScreen } from './SearchScreen';
import { Permissions } from 'expo';
import { ErrorDialog } from '../components/ErrorDialog';

MapboxGL.setAccessToken(MAP_BOX_API);

const DEFAULT_ZOOM_LEVEL = 11;
const MAX_ZOOM_LEVEL = 16;
const SEARCH_HEIGHT_SCREEN_RATIO = 0.6;

type ClusterParamsType = {
  bound: Bound,
  zoom: number;
}

type Props = {
  navigation: NavigationScreenProp<NavigationState>
  sites: GeoJSONCollection,
};

type State = {
  bound?: Bound; // [westLng, southLat, eastLng, northLat]
  currentSite?: VoltaSite,
  data: Cluster[],
  isPermissionGranted: boolean;
  isShowingError: boolean;
  isShowingFullSummary: boolean;
  isSearching: boolean;
  zoom?: number,
};

export class _MapScreen extends React.Component<Props, State> {
  static navigationOptions: NavigationScreenConfig<NavigationScreenOptions> = ({ navigation }) => {
    const params = navigation.state.params || {};
    const toggleSearch = params.toggleSearch || (() => {});

    return {
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
      headerRight: (
        <MaterialCommunityIcons
          name="map-search-outline"
          size={24}
          style={styles.headerIcon}
          onPress={toggleSearch}
        />
      ),
    }
  };

  cluster: Supercluster;
  map: MapboxGL.MapView;

  constructor(props: Props) {
    super(props);
  
    this.state = {
      bound: null,
      currentSite: null,
      data: [],
      isPermissionGranted: true,
      isShowingError: false,
      isShowingFullSummary: false,
      isSearching: false,
      zoom: 11,
    };

    props.navigation.setParams({
      toggleSearch: this.toggleSearch,
    })
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.sites.features !== nextProps.sites.features) {
      this.clusterize(nextProps.sites.features);
    }
  }

  toggleSearch = () => {
    this.setState(({ isSearching }) => ({
      isShowingFullSummary: false,
      isSearching: !isSearching
    }));
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
    // zoom must be an integer
    this.cluster.getClusters(params.bound, Math.floor(params.zoom))
  );

  handleFinishRenderingMapFully = async () => {
    const moveToLocation = (longitude: number, latitude: number) => {
      this.map.setCamera({
        centerCoordinate: [longitude, latitude],
        zoom: DEFAULT_ZOOM_LEVEL,
        duration: 350,
      });
  
      this.setState({
        currentSite: null,
      }, () => {
        const { sites } = this.props;
        this.clusterize(sites.features);
      });
    };

    const { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status === 'granted') {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { longitude, latitude } }) => {
          moveToLocation(longitude, latitude);
        },
        (error) => {
          Alert.alert('error', `${error}`);
        }
      );

    } else {
      this.setState({
        isPermissionGranted: false,
        isShowingError: true,
      }, () => {
        moveToLocation(-122.40144, 37.768374);
      });
    }
  };

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

    this.setState({ currentSite: null });
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

  handleSiteSummaryPress = (isShowingFullSummary: boolean) => {
    this.setState({
      isShowingFullSummary,
      isSearching: false
    });
  };

  handleDismiss = () => {
    this.setState({ currentSite: null });
  };

  handleSelectSearchedItem = (data: Feature<Point, VoltaSite> | CitiesResponse) => {
    // @ts-ignore
    const isSiteData = !!data.properties;

    if (isSiteData) {
      const { geometry: { coordinates }, properties } = data as Feature<Point, VoltaSite>;

      this.map.setCamera({
        centerCoordinate: coordinates,
        zoom: MAX_ZOOM_LEVEL,
        duration: 350,
      });

      this.setState({
        currentSite: properties,
        isSearching: false,
      });
    } else {
      const { longitude, latitude } = data as CitiesResponse;

      this.map.setCamera({
        centerCoordinate: [Number(longitude), Number(latitude)],
        zoom: DEFAULT_ZOOM_LEVEL,
        duration: 350,
      });

      this.setState({
        currentSite: null,
        isSearching: false,
      });
    }
  };

  handleErrorDismiss = () => {
    this.setState(({ isShowingError }) => ({
      isShowingError: !isShowingError,
    }));
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
    const { currentSite } = this.state;
    return (
      <Annotation
        availableStations={available}
        coordinate={coordinates}
        currentSite={currentSite}
        id={id}
        isSite={!isCluster}
        key={id}
        onPress={onPress}
        site={dataPoint}
        totalStations={total}
      />
    );
  };
  
  render() {
    const { sites: { features } } = this.props;
    const {
      currentSite, data, isPermissionGranted, isShowingError, isShowingFullSummary, isSearching,
    } = this.state;

    const { height } = Dimensions.get('window');
    const searchHeight = PixelRatio.roundToNearestPixel(height * SEARCH_HEIGHT_SCREEN_RATIO);
    const searchHeightStyle = {
      maxHeight: searchHeight,
    };

    return (
      <View style={StyleSheet.absoluteFill}>
        {/*
          onPress prop of MapView doesn't work so well when there's an overlay on top 
          (it requires two touches to active the touch event).
        */}
        <TouchableWithoutFeedback onPress={this.handleDismiss} style={StyleSheet.absoluteFill}>
          <MapboxGL.MapView
            onDidFinishRenderingMapFully={this.handleFinishRenderingMapFully}
            onRegionDidChange={this.handleRegionDidChange}
            ref={(map: MapboxGL.MapView) => this.map = map}
            showUserLocation={isPermissionGranted}
            style={StyleSheet.absoluteFill}
            zoomLevel={DEFAULT_ZOOM_LEVEL}
          >
            {data.map(this.renderAnnotation)}
          </MapboxGL.MapView>
        </TouchableWithoutFeedback>

        {currentSite && (
          <SiteInfoPane
            isShowingFullSummary={isShowingFullSummary}
            onDismiss={this.handleDismiss}
            onSiteSummaryPress={this.handleSiteSummaryPress}
            site={currentSite}
          />
        )}

        {isPermissionGranted && (
          <TouchableWithoutFeedback onPress={this.handleFinishRenderingMapFully}>
            <View style={styles.reCenterIconContainer}>
              <MaterialCommunityIcons
                name="navigation"
                size={24}
              />
            </View>
          </TouchableWithoutFeedback>
        )}

        {isSearching && (
          <SearchScreen
            data={features}
            onDismiss={this.toggleSearch}
            onSelect={this.handleSelectSearchedItem}
            placeholder="Site name or zip code"
            style={[styles.searchPane, searchHeightStyle]}
          />
        )}

        {!isPermissionGranted && (
          <ErrorDialog
            error={strings.locationServiceDisabled}
            onDismiss={this.handleErrorDismiss}
            style={styles.error}
            visible={isShowingError}
          />
        )}
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
  searchPane: {
    borderRadius: 20,
    opacity: 0.75,
    padding: 20,
    position: 'absolute',
    left: 8,
    top: 8,
    right: 8,
  },
  error: {
    backgroundColor: `${colors.primary.lighten(0.35)}`,
  },
});

export const MapScreen = (() => {
  const mapStateToProps = (state: ReduxState) => ({
    sites: state.sites,
  });

  const mapDispatchToProps = {};

  return connect(mapStateToProps, mapDispatchToProps)(_MapScreen);
})();

