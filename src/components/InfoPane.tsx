import React from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { colors } from '../values/colors';
import { VoltaSite } from '../values/types';
import { HORIZONTAL_SPACE, VERTICAL_SPACE } from '../values/constants';

const SUMMARY_HEIGHT = 136;

type Props = {
  site: VoltaSite,
};
// TODO: Remember to add `static defaultProps = DEFAULT_PROPS;` to the component
const DEFAULT_PROPS = {
  
};

type State = {
  isFullView: boolean;
};

export class InfoPane extends React.Component<Props & typeof DEFAULT_PROPS, State> {
  state = {
    isFullView: false,
  };

  translateY = new Animated.Value(0);

  handleSummaryPress = () => {
    const { height } = Dimensions.get('window');

    this.setState(({ isFullView }) => {
      return {
        isFullView: !isFullView,
      };
    }, () => {
      const { isFullView } = this.state;
      Animated.spring(this.translateY, {
        toValue: (isFullView ? 0 : SUMMARY_HEIGHT - height * 0.8),
        useNativeDriver: true,
      }).start();
    });
  };

  render() {
    const { height } = Dimensions.get('window');
    const positionStyle = {
      bottom: SUMMARY_HEIGHT - height * 0.8,
      height: height * 0.8,
    };
    const translateYStyle = {
      transform: [{ translateY: this.translateY }]
    };

    const { site } = this.props;
    const { available, total, level } = site.chargers[0];

    return (
      <Animated.View style={[styles.container, positionStyle, translateYStyle]}>
        <TouchableWithoutFeedback onPress={this.handleSummaryPress}>
          <View style={styles.summary}>
            <React.Fragment>
              <Text style={styles.siteName}>{site.name}</Text>
              <Text style={styles.chargers}>{`${available} of ${total} chargers available - ${level}`}</Text>
            </React.Fragment>
            </View>
        </TouchableWithoutFeedback>

        <ScrollView>

        </ScrollView>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${colors.white}`,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  summary: {
    height: SUMMARY_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_SPACE,
    paddingVertical: VERTICAL_SPACE,
  },
  siteName: {
    fontSize: 24,
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'left',
  },
  chargers: {
    color: `${colors.hint}`,
    fontSize: 14,
    textTransform: 'uppercase',
    textAlign: 'left',
  },
});
