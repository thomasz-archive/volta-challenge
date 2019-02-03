import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { VoltaSite, GeoJSON } from '../values/types';
import { colors } from '../values/colors';

const SIZE = 48;

type Props = {
  availableStations: number;
  totalStations: number;
  coordinate: [number, number];
  id: string;
  onPress: (geo: GeoJSON) => Promise<void> | void;
  site: GeoJSON,
};

export const Annotation: React.FunctionComponent<Props> = ({
  availableStations, totalStations, coordinate, id, onPress, site,
}) => (
  <TouchableWithoutFeedback onPress={() => onPress(site)}>
    <MapboxGL.PointAnnotation
      key={id}
      id={id}
      coordinate={coordinate}
    >
      <View style={styles.annotationContainer}>
        <View style={styles.annotationFill}>
          <Text style={styles.counterText}>
            {availableStations}
          </Text>
        </View>
      </View>
    </MapboxGL.PointAnnotation>
  </TouchableWithoutFeedback>
);

const styles = StyleSheet.create({
  annotationContainer: {
    alignItems: 'center',
    backgroundColor: `${colors.black.alpha(0.8)}`,
    borderRadius: SIZE / 2,
    height: SIZE,
    justifyContent: 'center',
    width: SIZE,
  },
  annotationFill: {
    alignItems: 'center',
    borderColor: `${colors.secondary}`,
    borderRadius: SIZE / 2,
    borderWidth: SIZE * 0.15,
    height: SIZE,
    justifyContent: 'center',
    transform: [{ scale: 0.8 }],
    width: SIZE,
  },
  counterText: {
    color: `${colors.white}`,
    fontSize: 20,
    fontWeight: '500',
  },
});
