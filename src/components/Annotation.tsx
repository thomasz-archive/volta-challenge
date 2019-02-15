import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import { Feature, GeoJsonProperties, Point } from 'geojson';

import { colors } from '../values/colors';
import { VoltaSite } from '../values/types';
import { ProgressRing } from './ProgressRing';

const ANNOTATION_SIZE = 48;

type Props = {
  availableStations: number;
  coordinate: number[];
  currentSite: VoltaSite;
  id: string;
  isSite?: boolean;
  onPress: (geo: Feature<Point, GeoJsonProperties>) => void;
  site: Feature<Point, GeoJsonProperties>;
  totalStations: number;
};

export const Annotation: React.FunctionComponent<Props> = ({
  availableStations,
  currentSite,
  coordinate,
  id,
  isSite,
  onPress,
  site,
  totalStations,
}) => {
  /* prettier-ignore */
  const indicatorColorStyle = currentSite && (
    currentSite.id === site.properties.id
      ? colors.secondary.darken(0.35)
      : colors.black.alpha(0.8)
  );

  const indicatorStyle = currentSite ? { color: `${indicatorColorStyle}` } : {};

  /* prettier-ignore */
  return (
    <TouchableWithoutFeedback onPress={() => onPress(site)}>
      <MapboxGL.PointAnnotation
        key={id}
        id={id}
        coordinate={coordinate}
      >
        <View>
          <View style={styles.annotationContainer}>
            <ProgressRing
              backgroundColor={colors.black.alpha(0.8)}
              ringWidth={5}
              ringActiveColor={colors.secondary}
              ringInactiveColor={colors.hint}
              percent={(availableStations / totalStations) * 100}
              size={ANNOTATION_SIZE * 0.8}
            >
              <Text style={styles.counterText}>{`${availableStations}`}</Text>
            </ProgressRing>
          </View>

          {isSite && (
            <View style={styles.iconContainer}>
              <AntDesign
                name="caretdown"
                size={18}
                style={indicatorStyle}
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
