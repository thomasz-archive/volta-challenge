import React from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  SafeAreaView,
  ScrollView,
  SectionListData,
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import { Constants } from 'expo';
import {
  NavigationScreenProp,
  NavigationState,
  NavigationEventSubscription,
} from 'react-navigation';
import { connect } from 'react-redux';

import { ReduxState } from '../reducers';
import { GeoJSONCollection } from '../values/types';
import { generateSummary } from '../utils/volta_utils';
import { CircleButton } from '../components/CircleButton';
import { colors } from '../values/colors';
import { HORIZONTAL_SPACE, VERTICAL_SPACE } from '../values/constants';
import { ChartBar } from '../components/ChartBar';

type ListItem = {
  title: string;
  data: [
    {
      key: string;
      value: number;
    }
  ];
};

type Props = {
  navigation: NavigationScreenProp<NavigationState>;
  sites: GeoJSONCollection;
};

type MetricsPair = {
  key: string;
  value: number;
};
type State = {
  isLoading: boolean;
  siteMetrics: Array<SectionListData<MetricsPair>>;
};

class _SiteMetricsScreen extends React.Component<Props, State> {
  componentBlurListener: NavigationEventSubscription;

  state = {
    isLoading: true,
    siteMetrics: [],
  };

  componentDidMount() {
    const {
      sites: { features },
    } = this.props;
    const siteMetrics = generateSummary(features).sectionListData;

    this.setState(
      {
        siteMetrics,
      },
      () => {
        this.setState({ isLoading: false });
      }
    );

    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleHardwareBackPress
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleHardwareBackPress
    );

    this.componentBlurListener.remove();
  }

  handleHardwareBackPress = () => {
    this.handleBackPress();
    return true;
  };

  handleBackPress = () => {
    const {
      navigation: { goBack },
    } = this.props;
    goBack();
  };

  renderListItem = ({ item }: { item: ListItem }) => {
    const { title, data } = item;

    const maxValue = data.reduce(
      (min, d) => (min < d.value ? d.value : min),
      -Infinity
    );

    /* prettier-ignore */
    return (
      <View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>
            {title}
          </Text>
        </View>

        {/* <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        > */}
        <View style={{
          flexDirection: 'row',
        }}>
          {data.map(({ key, value }) => (
            <ChartBar
              key={key}
              label={key}
              navigation={this.props.navigation}
              ratio={value / maxValue}
              style={{ flex: 1 }}
              value={value}
            />
          ))}
          </View>
        {/* </ScrollView> */}
      </View>
    );
  };

  render() {
    const { isLoading, siteMetrics } = this.state;

    if (isLoading) return <ActivityIndicator />;

    /* prettier-ignore */
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <FlatList
          data={siteMetrics}
          keyExtractor={({ title }) => title}
          renderItem={this.renderListItem}
        />

        <CircleButton
          backgroundColor={colors.primary}
          buttonSize={64}
          iconColor={colors.white}
          iconSize={36}
          name="close"
          onPress={this.handleBackPress}
          style={styles.circleButton}
        />
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
    backgroundColor: `${colors.white}`,
    flex: 1,
    marginTop: statusBarHeight + VERTICAL_SPACE,
    marginHorizontal: HORIZONTAL_SPACE,
  },
  sectionHeader: {
    backgroundColor: `${colors.black.alpha(0.1)}`,
    padding: 4,
    marginVertical: 12,
  },
  sectionHeaderText: {
    color: `${colors.primary}`,
    textTransform: 'uppercase',
  },
  circleButton: {
    bottom: 48,
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
});

export const SiteMetricsScreen = (() => {
  const mapStateToProps = (state: ReduxState) => ({
    sites: state.sites,
  });

  const mapDispatchToProps = {};

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(_SiteMetricsScreen);
})();
