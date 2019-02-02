import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { VoltaSite } from '../values/types';
import { colors } from '../values/colors';

const SIZE = 48;

type Props = {
  coordinate: [number, number];
  onPress: (site: VoltaSite) => void;
  site: VoltaSite,
};

export const Annotation: React.FunctionComponent<Props> = ({ coordinate, onPress, site }) => (    
  <TouchableWithoutFeedback onPress={() => onPress(site)}>
    <MapboxGL.PointAnnotation
      key={site.id}
      id={site.id}
      coordinate={coordinate}
    >
      <View style={styles.annotationContainer}>
        <View style={styles.annotationFill}>
          <Text style={styles.counterText}>
            {site.stations.filter(station => station['meter_status'][0] === 'idle').length}
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
