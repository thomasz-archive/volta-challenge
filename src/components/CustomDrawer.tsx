import React from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  DrawerItemsProps,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import { Constants } from 'expo';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../values/colors';

type Props = {
  navigation: NavigationScreenProp<NavigationState>;
};

type State = {};

export class CustomDrawer extends React.Component<DrawerItemsProps> {
  handleItemPress = (key: string) => () => {
    const { navigation } = this.props;
    navigation.navigate(key);
  };

  /* prettier-ignore */
  render() {
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('../../assets/volta_logo.png')}
            style={styles.avatar}
          />
        </View>

        <View style={styles.linksContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.link}
              onPress={this.handleItemPress('SiteMetrics')}
            >
              <Ionicons
                name="ios-stats"
                size={24}
                style={styles.linkIcon}
              />

              <Text style={styles.linkText}>
                Site Metrics
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

const statusBarHeight =
  Platform.OS === 'ios' && Number(Platform.Version) >= 11
    ? 0
    : Constants.statusBarHeight;

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    marginTop: statusBarHeight,
  },
  avatarContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  avatar: {
    borderColor: `${colors.black.lighten(0.3)}`,
    borderRadius: 70,
    borderWidth: StyleSheet.hairlineWidth,
    height: 140,
    resizeMode: 'contain',
    width: 140,
  },
  linksContainer: {
    flex: 3,
    marginVertical: 32,
  },
  link: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkIcon: {
    color: `${colors.primary}`,
    marginRight: 8,
  },
  linkText: {
    color: `${colors.primary}`,
  },
});
