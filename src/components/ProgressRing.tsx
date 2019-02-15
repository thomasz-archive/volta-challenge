import React from 'react';
import { StyleSheet, StyleProp, View, ViewStyle } from 'react-native';
import Color from 'Color';

type Props = {
  backgroundColor: Color;
  children?: JSX.Element[] | JSX.Element;
  percent: number;
  ringActiveColor: Color;
  ringInactiveColor: Color;
  ringWidth: number;
  size: number;
  style?: StyleProp<ViewStyle>;
};
const DEFAULT_PROPS = {
  children: [],
  style: {},
};

export const ProgressRing: React.FunctionComponent<Props> = ({
  backgroundColor,
  children,
  percent,
  ringActiveColor,
  ringInactiveColor,
  ringWidth,
  size,
  style,
}) => {
  /* prettier-ignore */
  const ringColor = percent >= 50 ? {
    parent: ringInactiveColor,
    child: ringActiveColor,
  } : {
    parent: ringActiveColor,
    child: ringInactiveColor,
  };

  /* prettier-ignore */
  const ringRotation = percent >= 50 ? {
    left: (100 - percent) * -3.6,
    right: 0,
  } : {
    left: 0,
    right: percent * 3.6,
  };

  const parentStyle = {
    backgroundColor: `${ringColor.parent}`,
    borderRadius: size / 2,
    height: size,
    width: size,
  };

  const leftRingRotationStyle = {
    ...StyleSheet.absoluteFillObject,
    transform: [{ rotate: `${ringRotation.left}deg` }],
  };

  const rightRingRotationStyle = {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row' as 'row',
    justifyContent: 'flex-end' as 'flex-end',
    transform: [{ rotate: `${ringRotation.right}deg` }],
  };

  const sharedRingStyle = {
    backgroundColor: `${ringColor.child}`,
    borderRadius: size / 2,
    height: size,
    width: size / 2,
  };

  const leftRingStyle = {
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
  };

  const rightRingStyle = {
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
  };

  const innerCircleStyle = {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center' as 'center',
    backgroundColor: `${backgroundColor}`,
    borderRadius: (size - 2 * ringWidth) / 2,
    justifyContent: 'center' as 'center',
    margin: ringWidth,
  };

  /* prettier-ignore */
  return (
    <View style={[styles.container, parentStyle, style]}>
      <View style={leftRingRotationStyle}>
        <View style={[sharedRingStyle, leftRingStyle]} />
      </View>

      <View style={rightRingRotationStyle}>
        <View style={[sharedRingStyle, rightRingStyle]} />
      </View>

      <View style={innerCircleStyle}>
        {children}
      </View>
    </View>
  );
};

ProgressRing.defaultProps = DEFAULT_PROPS;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  leftRing: {},
  rightRing: {},
});
