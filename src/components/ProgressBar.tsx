import React from 'react';
import {
  Animated,
  Dimensions,
  PixelRatio,
  StyleSheet,
  View,
} from 'react-native';

import { colors } from '../values/colors';

type Props = {
  percent: number;
};

type State = {};

export class ProgressBar extends React.Component<Props, State> {
  left: number;
  translateX = new Animated.Value(0);

  componentWillReceiveProps(nextProps: Props) {
    const { percent } = this.props;
    if (percent !== nextProps.percent) {
      this.playAnimation(nextProps.percent);
    }
  }

  playAnimation = (to: number) => {
    const { width } = Dimensions.get('window');

    Animated.timing(this.translateX, {
      duration: 500,
      toValue: PixelRatio.roundToNearestPixel(to * width - this.left),
      useNativeDriver: true,
    }).start();
  };

  handleLayout = ({ nativeEvent: { layout } }) => {
    const { width } = Dimensions.get('window');
    this.left = (width - layout.width) / 2;

    const { percent } = this.props;
    this.playAnimation(percent);
  };

  render() {
    const translateXStyle = {
      transform: [{ translateX: this.translateX }],
    };

    /* prettier-ignore */
    return (
      <View
        onLayout={this.handleLayout}
        style={styles.container}
      >
        <Animated.View style={[styles.progress, translateXStyle]} />
      </View>
    );
  }
}
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${colors.primary.alpha(0.15)}`,
  },
  progress: {
    backgroundColor: `${colors.secondary}`,
    position: 'absolute',
    bottom: 0,
    left: -width,
    top: 0,
    width,
  },
});
