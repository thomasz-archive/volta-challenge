import React from 'react';
import { createDrawerNavigator } from 'react-navigation';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MapModal } from './MapModal';
import { SiteMetricsScreen } from '../screens/SiteMetricsScreen';

const getDrawerItemIcon = (icon: string) => ({ tintColor }: { tintColor: string }) => (
  <MaterialCommunityIcons
    name={icon}
    size={24}
    style={{ color: tintColor }}
  />
);

export const RootDrawer = createDrawerNavigator({
  Map: {
    screen: MapModal,
    navigationOptions: {
      drawerLabel: () => null,
    },
  },
  SiteMetrics: {
    screen: SiteMetricsScreen,
    navigationOptions: {
      drawerIcon: getDrawerItemIcon('google-analytics'),
      drawerLabel: 'Site Metrics',
    },
  },
}, {
  initialRouteName: 'Map',
});
