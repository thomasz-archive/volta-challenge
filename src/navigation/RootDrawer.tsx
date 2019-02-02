import React from 'react';
import { createDrawerNavigator } from 'react-navigation';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MapModal } from './MapModal';
import { SettingsScreen } from '../screens/SettingsScreen';
import { FAQScreen } from '../screens/FAQScreen';

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
  Settings: {
    screen: SettingsScreen,
    navigationOptions: {
      drawerIcon: getDrawerItemIcon('settings'),
      drawerLabel: 'Settings',
    },
  },
  FAQ: {
    screen: FAQScreen,
    navigationOptions: {
      drawerIcon: getDrawerItemIcon('comment-question-outline'),
      drawerLabel: 'FAQ',
    },
  },
}, {
  initialRouteName: 'Map',
});
