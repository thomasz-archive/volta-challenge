import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import ProgressCircle from 'react-native-progress-circle'
import {
  Feature,
  GeoJsonProperties,
  Point,
} from 'geojson';

import { colors } from '../values/colors';
import { AntDesign } from '@expo/vector-icons';
import { VoltaSite } from '../values/types';

const ANNOTATION_SIZE = 48;

type Props = {
  availableStations: number;
  coordinate: number[];
  currentSite: VoltaSite,
  id: string;
  isSite?: boolean;
  onPress: (geo: Feature<Point, GeoJsonProperties>) => void;
  site: Feature<Point, GeoJsonProperties>,
  totalStations: number;
};

export const Annotation: React.FunctionComponent<Props> = ({
  availableStations, currentSite, coordinate, id, isSite, onPress, site, totalStations,
}) => {
  const iconStyle = currentSite ? {
    color: `${currentSite.id === site.properties.id ? colors.secondary.darken(0.35) : colors.black.alpha(0.8)}`,
  } : {};

  return (
    <TouchableWithoutFeedback onPress={() => onPress(site)}>
      <MapboxGL.PointAnnotation
        key={id}
        id={id}
        coordinate={coordinate}
      >
        <View>
          <View style={styles.annotationContainer}>
            <ProgressCircle
              bgColor={`${colors.black.alpha(0.8)}`}
              borderWidth={5}
              color={`${colors.secondary}`}
              percent={availableStations / totalStations * 100}
              radius={ANNOTATION_SIZE * 0.4}
            >
              <Text style={styles.counterText}>
                {`${availableStations}`}
              </Text>
            </ProgressCircle>
          </View>

          {isSite && (
            <View style={styles.iconContainer}>
              <AntDesign
                name="caretdown"
                size={18}
                style={iconStyle}
              />
            </View>
          )}
        </View>
      </MapboxGL.PointAnnotation>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  annotationContainer: {
    alignItems: 'center',
    backgroundColor: `${colors.black.alpha(0.8)}`,
    borderRadius: ANNOTATION_SIZE / 2,
    height: ANNOTATION_SIZE,
    justifyContent: 'center',
    width: ANNOTATION_SIZE,
  },
  counterText: {
    color: `${colors.white}`,
    fontSize: 18,
    fontWeight: '500',
  },
  iconContainer: {
    alignItems: 'center',
  },
});
