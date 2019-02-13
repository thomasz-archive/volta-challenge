import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  NavigationState,
  NavigationScreenProp,
  NavigationEventSubscription,
} from 'react-navigation';

import { colors } from '../values/colors';

const BAR_MAX_HEIGHT = 100;
const BAR_WIDTH = 40;

type Props = {
  label: string;
  navigation: NavigationScreenProp<NavigationState>;
  ratio: number;
  shouldPlayBarAnimations: boolean;
  style?: StyleProp<ViewStyle>;
  value: number;
};
const DEFAULT_PROPS = {
  style: {},
};

type State = {};

export class ChartBar extends React.Component<Props, State> {
  static defaultProps = DEFAULT_PROPS;

  subscriptions: NavigationEventSubscription[];
  scaleY = new Animated.Value(1);

  componentDidMount() {
    this.playAnimation();

    const { navigation } = this.props;
    this.subscriptions = [
      navigation.addListener('didFocus', this.componentDidFocus),
      navigation.addListener('willBlur', this.componentWillBlur),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.remove());
  }

  componentDidFocus = () => {
    this.playAnimation();
  };

  componentWillBlur = () => {
    this.scaleY.setValue(1);
  };

  playAnimation = () => {
    const { ratio } = this.props;

    Animated.timing(this.scaleY, {
      duration: 500,
      toValue: BAR_MAX_HEIGHT * ratio,
      useNativeDriver: true,
    }).start();
  };

  render() {
    const { label, style, value } = this.props;

    const barHeightStyle = {
      height: 1,
      transform: [{ scaleY: this.scaleY }, { translateY: -0.5 }],
    };

    const labelStyle = {
      transform: [{ translateY: Animated.multiply(this.scaleY, -1) }],
    };

    /* prettier-ignore */
    return (
      <View style={[styles.container, style]}>
        <Animated.Text style={[styles.value, , labelStyle]}>
          {value}
        </Animated.Text>

        <Animated.View style={[styles.bar, barHeightStyle]} />

        <Text
          ellipsizeMode="tail"
          numberOfLines={2}
          style={styles.label}
        >
          {label}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: BAR_MAX_HEIGHT + 70,
  },
  value: {
    color: `${colors.primary}`,
    fontWeight: '300',
    fontSize: 12,
  },
  bar: {
    backgroundColor: `${colors.secondary}`,
    height: 1,
    marginVertical: 4,
    width: BAR_WIDTH,
  },
  label: {
    color: `${colors.primary}`,
    fontSize: 12,
    fontWeight: '500',
    height: 32,
    textAlign: 'center',
  },
});
