import React from 'react';
import { Dimensions, Image, PixelRatio, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  NavigationScreenConfig,
  NavigationScreenOptions,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import { connect } from 'react-redux';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import { Feature, Point } from 'geojson';

import { colors } from '../values/colors';
import { strings } from '../values/strings';
import { HORIZONTAL_SPACE } from '../values/constants';
import { GeoJSONCollection, VoltaSite, CitiesResponse } from '../values/types';
import { ReduxState } from '../reducers';
import { SiteInfoPane } from '../components/SiteInfoPane';
import { SearchScreen } from './SearchScreen';
import { ErrorDialog } from '../components/ErrorDialog';
import { Map } from '../components/Map';

const DEFAULT_ZOOM_LEVEL = 11;
const MAX_ZOOM_LEVEL = 16;
const SEARCH_HEIGHT_SCREEN_RATIO = 0.6;

type Props = {
  navigation: NavigationScreenProp<NavigationState>;
  sites: GeoJSONCollection;
};

type State = {
  currentSite?: VoltaSite;
  isPermissionGranted: boolean;
  isShowingError: boolean;
  isShowingFullSummary: boolean;
  isSearching: boolean;
  zoom?: number;
};

export class _MapScreen extends React.Component<Props, State> {
  static navigationOptions: NavigationScreenConfig<NavigationScreenOptions> = ({
    navigation,
  }) => {
    const params = navigation.state.params || {};
    const toggleSearch = params.toggleSearch || (() => {});

    /* prettier-ignore */
    return {
      headerLeft: (
        <MaterialCommunityIcons
          name="menu"
          size={24}
          style={styles.headerIcon}
          onPress={() => navigation.toggleDrawer()}
        />
      ),
      headerTitle: (
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
    };
  };

  mapView: MapboxGL.MapView;

  constructor(props: Props) {
    super(props);

    this.state = {
      currentSite: null,
      isPermissionGranted: true,
      isShowingError: false,
      isShowingFullSummary: false,
      isSearching: false,
      zoom: DEFAULT_ZOOM_LEVEL,
    };

    props.navigation.setParams({
      toggleSearch: this.toggleSearch,
    });
  }

  toggleSearch = () => {
    this.setState(({ isSearching }) => ({
      isShowingFullSummary: false,
      isSearching: !isSearching,
    }));
  };

  setMapRef = (mapView: MapboxGL.MapView) => {
    this.mapView = mapView;
  };

  handleLocationPermissionRejected = () => {
    this.setState({
      isPermissionGranted: false,
      isShowingError: true,
    });
  };

  handleSelectSite = (site: VoltaSite, callback?: () => void) => {
    this.setState({ currentSite: site }, callback);
  };

  handleSiteSummaryPress = (isShowingFullSummary: boolean) => {
    this.setState({
      isShowingFullSummary,
      isSearching: false,
    });
  };

  handleSiteSummaryDismiss = () => {
    this.setState({ currentSite: null });
  };

  handleSelectSearchedItem = (
    data: Feature<Point, VoltaSite> | CitiesResponse
  ) => {
    const isSiteData = 'properties' in data;

    if (isSiteData) {
      const {
        geometry: { coordinates },
        properties,
      } = data as Feature<Point, VoltaSite>;

      this.mapView.setCamera({
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

      this.mapView.setCamera({
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

  render() {
    const {
      sites: { features },
    } = this.props;

    const {
      currentSite,
      isPermissionGranted,
      isShowingError,
      isShowingFullSummary,
      isSearching,
    } = this.state;

    const { height } = Dimensions.get('window');
    const searchHeight = PixelRatio.roundToNearestPixel(
      height * SEARCH_HEIGHT_SCREEN_RATIO
    );
    const searchHeightStyle = {
      maxHeight: searchHeight,
    };

    /* prettier-ignore */
    return (
      <View style={StyleSheet.absoluteFill}>
        <Map
          currentSite={currentSite}
          data={features}
          defaultZoomLevel={DEFAULT_ZOOM_LEVEL}
          onSiteSummaryDismiss={this.handleSiteSummaryDismiss}
          onMapRef={this.setMapRef}
          onLocationPermissionRejected={this.handleLocationPermissionRejected}
          onSelectSite={this.handleSelectSite}
          style={StyleSheet.absoluteFill}
        />

        {currentSite && (
          <SiteInfoPane
            isShowingFullSummary={isShowingFullSummary}
            onDismiss={this.handleSiteSummaryDismiss}
            onSiteSummaryPress={this.handleSiteSummaryPress}
            site={currentSite}
          />
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
            backgroundColor={colors.primary}
            error={strings.locationServiceDisabled}
            onDismiss={this.handleErrorDismiss}
            style={styles.error}
            tintColor={colors.white}
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

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(_MapScreen);
})();
