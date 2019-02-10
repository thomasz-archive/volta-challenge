import React from 'react';
import {
  Animated,
  StyleProp,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Color from 'color';

import { FAB_ELEVATION } from '../values/constants';

type Props = {
  backgroundColor: Color;
  buttonSize: number;
  iconColor: Color;
  iconSize: number;
  name: string;
  onPress: () => void;
  style: StyleProp<ViewStyle>;
};

export class CircleButton extends React.Component<Props> {
  scale = new Animated.Value(1);

  handlePressIn = () => {
    Animated.timing(this.scale, {
      toValue: 0.85,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  handlePressOut = () => {
    Animated.timing(this.scale, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  render() {
    const {
      backgroundColor,
      buttonSize,
      iconColor,
      iconSize,
      name,
      onPress,
      style,
    } = this.props;

    const containerStyle = {
      alignItems: 'center',
      backgroundColor: `${backgroundColor}`,
      borderRadius: buttonSize / 2,
      height: buttonSize,
      justifyContent: 'center',
      transform: [{ scale: this.scale }],
      width: buttonSize,
    };

    const iconStyle = {
      color: `${iconColor}`,
      transform: [{ scale: this.scale }],
    };

    const AnimatedMaterialIcons = Animated.createAnimatedComponent(
      MaterialIcons
    );

    /* prettier-ignore */
    return (
      <TouchableWithoutFeedback
        onPress={onPress}
        onPressIn={this.handlePressIn}
        onPressOut={this.handlePressOut}
      >
        <Animated.View
          elevation={FAB_ELEVATION}
          style={[containerStyle, style]}
        >
          <AnimatedMaterialIcons
            name={name}
            size={iconSize}
            style={iconStyle}
          />
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}
