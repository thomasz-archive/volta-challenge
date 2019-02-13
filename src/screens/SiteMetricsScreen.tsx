import React from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  SafeAreaView,
  SectionList,
  SectionListData,
  SectionListRenderItemInfo,
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import { Constants } from 'expo';
import { NavigationScreenProp, NavigationState } from 'react-navigation';
import { connect } from 'react-redux';

import { ReduxState } from '../reducers';
import { GeoJSONCollection } from '../values/types';
import { generateSummary } from '../utils/volta_utils';
import { CircleButton } from '../components/CircleButton';
import { colors } from '../values/colors';
import { HORIZONTAL_SPACE, VERTICAL_SPACE } from '../values/constants';

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
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      siteMetrics: [],
    };
  }

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

  renderMetricsSectionHeader = ({
    section,
  }: {
    section: SectionListData<MetricsPair>;
  }) => {
    const { title } = section;

    /* prettier-ignore */
    return (
      <Text style={styles.header}>
        {title}
      </Text>
    );
  };

  renderMetricsSectionListItem = (
    info: SectionListRenderItemInfo<MetricsPair>
  ) => {
    const {
      item: { key, value },
    } = info;
    // // regex code credit to:
    // // https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    // const titleKey = key.replace(
    //   /\w\S*/g,
    //   word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    // );

    /* prettier-ignore */
    return (
      <View style={styles.rowContainer}>
        {}
      </View>
    );
  };

  renderListItem = ({ item }) => {
    const { title, data } = item;

    const maxHeight = data.reduce(
      (min, d) => (min < d.value ? d.value : min),
      -Infinity
    );

    return (
      <View>
        <Text>{title}</Text>

        <View style={styles.rowContainer}>
          {data.map(d => (
            <View
              style={{
                flex: 1,
                marginRight: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: `${colors.secondary}`,
                  height: (100 * d.value) / maxHeight,
                }}
              />
              <Text>{d.key}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  render() {
    const { isLoading, siteMetrics } = this.state;

    const modifiedData = siteMetrics.map(metric => ({
      ...metric,
      data: [metric.title],
    }));

    console.log('================================================');
    console.log('siteMetrics:', siteMetrics);
    console.log('================================================');

    if (isLoading) return <ActivityIndicator />;

    /* prettier-ignore */
    return (
      <SafeAreaView style={styles.safeAreaView}>
        {/* <SectionList
          keyExtractor={item => item.key}
          renderItem={this.renderMetricsSectionListItem}
          renderSectionHeader={this.renderMetricsSectionHeader}
          sections={modifiedData}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        /> */}

        <FlatList
          data={siteMetrics}
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
  header: {
    color: `${colors.secondary}`,
    fontSize: 20,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  listItem: {
    color: `${colors.primary}`,
    fontSize: 15,
    lineHeight: 26,
  },
  circleButton: {
    bottom: 48,
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  rowContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
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
