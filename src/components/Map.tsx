import React from 'react';
import {
  Alert,
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import { Feature, GeoJsonProperties, Point } from 'geojson';
import { Supercluster, Cluster } from 'supercluster';

import { MAP_BOX_API } from '../values/secrets';
import { Annotation } from './Annotation';
import { Permissions } from 'expo';
import { supercluster, getChargerCount } from '../utils/supercluster';
import { Bound, MapBoxOnChangeEvent, VoltaSite } from '../values/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../values/colors';

MapboxGL.setAccessToken(MAP_BOX_API);

type ClusterParamsType = {
  bound: Bound;
  zoom: number;
};

type Props = {
  currentSite?: VoltaSite;
  data: Array<Feature<Point, GeoJsonProperties>>;
  defaultZoomLevel: number;
  onSiteSummaryDismiss: () => void;
  onMapRef: (mapView: MapboxGL.MapView) => void;
  onLocationPermissionGranted?: (callback?: () => void) => void;
  onLocationPermissionRejected?: (callback?: () => void) => void;
  onSelectSite: (site: VoltaSite, callback?: () => void) => void;
  style?: StyleProp<ViewStyle>;
};
const DEFAULT_PROPS = {
  onLocationPermissionGranted: () => {},
  onLocationPermissionRejected: () => {},
  style: () => {},
};

type State = {
  bound?: Bound; // [westLng, southLat, eastLng, northLat]
  clusters: Cluster[];
  isPermissionGranted: boolean;
  zoom?: number;
};

export class Map extends React.Component<Props, State> {
  static defaultProps = DEFAULT_PROPS;

  cluster: Supercluster;
  mapView: MapboxGL.MapView;

  state = {
    bound: null,
    clusters: [],
    isPermissionGranted: true,
    zoom: this.props.defaultZoomLevel,
  };

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.data !== nextProps.data) {
      this.clusterize(nextProps.data);
    }
  }

  clusterize = (data: Array<Feature<Point, GeoJsonProperties>>) => {
    if (!this.cluster) this.cluster = supercluster.init();
    this.cluster.load(data);

    const { bound, zoom } = this.state;
    if (bound && zoom) {
      this.setState({
        clusters: this.getClusters({ bound, zoom }),
      });
    }
  };

  getClusters = (params: ClusterParamsType) =>
    // zoom must be an integer
    this.cluster.getClusters(params.bound, Math.floor(params.zoom));

  setMapRef = (mapView: MapboxGL.MapView) => {
    this.mapView = mapView;

    const { onMapRef } = this.props;
    onMapRef(this.mapView);
  };

  handleFinishRenderingMapFully = async () => {
    const moveToLocation = (longitude: number, latitude: number) => {
      const { defaultZoomLevel, onSelectSite } = this.props;

      this.mapView.setCamera({
        centerCoordinate: [longitude, latitude],
        zoom: defaultZoomLevel,
        duration: 350,
      });

      onSelectSite(null, () => {
        const { data } = this.props;
        this.clusterize(data);
      });
    };

    const { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status === 'granted') {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { longitude, latitude } }) => {
          moveToLocation(longitude, latitude);
        },
        error => {
          Alert.alert('error', `${error}`);
        }
      );

      const { onLocationPermissionGranted } = this.props;
      onLocationPermissionGranted();
    } else {
      const { onLocationPermissionRejected } = this.props;
      onLocationPermissionRejected(() => {
        moveToLocation(-122.40144, 37.768374);
      });
    }
  };

  handleRegionDidChange = (geo: Feature<Point, GeoJsonProperties>) => {
    const properties = geo.properties as MapBoxOnChangeEvent;
    const visibleBounds = properties.visibleBounds;
    const zoomLevel = properties.zoomLevel;

    const params: ClusterParamsType = {
      bound: [
        visibleBounds[1][0],
        visibleBounds[1][1],
        visibleBounds[0][0],
        visibleBounds[0][1],
      ],
      zoom: zoomLevel,
    };

    const { data } = this.props;

    if (!this.cluster) this.cluster = supercluster.init();
    this.cluster.load(data);

    const clusters = this.getClusters(params);
    this.setState({
      ...params,
      clusters,
    });
  };

  handleRegionPress = (geo: Feature<Point, GeoJsonProperties>) => {
    const {
      geometry: { coordinates },
      properties,
    } = geo;
    const clusterId = properties['cluster_id'];

    // @ts-ignore - getClusterExpansionZoom doesn't accept second parameter per docs
    const expansionZoom = this.cluster.getClusterExpansionZoom(clusterId);

    this.mapView.setCamera({
      centerCoordinate: coordinates,
      zoom: expansionZoom + 0.7, // add 0.7 to avoid clustering
      duration: 100,
    });

    const { onSelectSite } = this.props;
    onSelectSite(null);
  };

  handleSingleSitePress = (geo: Feature<Point, GeoJsonProperties>) => {
    const {
      geometry: { coordinates },
    } = geo;
    const properties = geo.properties as VoltaSite;
    const { id } = properties;

    const { currentSite, onSelectSite } = this.props;
    const dismissCurrentSite = currentSite && currentSite.id === id;
    if (!dismissCurrentSite) this.mapView.moveTo(coordinates, 350);
    onSelectSite(dismissCurrentSite ? null : properties);
  };

  renderAnnotation = (dataPoint: Cluster) => {
    const { geometry, properties } = dataPoint;
    const isCluster = !!properties['cluster_id'];
    let id: string,
      available: number,
      total: number,
      onPress: (geo: Feature<Point, GeoJsonProperties>) => void;

    if (isCluster) {
      id = `REGION-${dataPoint.id}`;
      available = properties.availableStations || 0;
      total = properties.totalStations || 0;
      onPress = this.handleRegionPress;
    } else {
      id = `SITE-${properties.id}`;
      ({ available, total } = getChargerCount(properties.chargers));
      onPress = this.handleSingleSitePress;
    }

    const { coordinates } = geometry;
    const { currentSite } = this.props;

    /* prettier-ignore */
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
    const { defaultZoomLevel, onSiteSummaryDismiss, style } = this.props;
    const { clusters, isPermissionGranted } = this.state;

    /* prettier-ignore */
    return (
      <View style={style}>
        {/*
          onPress prop of MapView doesn't work so well when there's an overlay on top 
          (it requires two touches to active the touch event).
        */}
        <TouchableWithoutFeedback
          onPress={onSiteSummaryDismiss}
          style={StyleSheet.absoluteFill}
        >
          <MapboxGL.MapView
            onDidFinishRenderingMapFully={this.handleFinishRenderingMapFully}
            onRegionDidChange={this.handleRegionDidChange}
            ref={this.setMapRef}
            showUserLocation={isPermissionGranted}
            style={StyleSheet.absoluteFill}
            zoomLevel={defaultZoomLevel}
          >
            {clusters.map(this.renderAnnotation)}
          </MapboxGL.MapView>
        </TouchableWithoutFeedback>

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
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
