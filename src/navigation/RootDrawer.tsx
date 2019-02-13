import { createDrawerNavigator } from 'react-navigation';

import { MapModal } from './MapModal';
import { SiteMetricsScreen } from '../screens/SiteMetricsScreen';
import { CustomDrawer } from '../components/CustomDrawer';

export const RootDrawer = createDrawerNavigator(
  {
    Map: {
      screen: MapModal,
    },
    SiteMetrics: {
      screen: SiteMetricsScreen,
    },
  },
  {
    initialRouteName: 'Map',
    contentComponent: CustomDrawer,
  }
);
