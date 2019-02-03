import React from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { colors } from '../values/colors';
import { VoltaSite } from '../values/types';
import { Draggable } from './Draggable';
import { SiteSummary } from './SiteSummary';

const SUMMARY_HEIGHT = 184;
const UP_GESTURE_QUALIFICATION_RATIO = 0.25;
const DOWN_GESTURE_QUALIFICATION_RATIO = 0.35;

type Props = {
  onDismiss: () => void;
  site: VoltaSite,
};

type State = {
  isFullView: boolean;
};

export class SiteInfoPane extends React.Component<Props, State> {
  state = {
    isFullView: false,
  };

  enabled: boolean;
  translateY = new Animated.Value(0);

  handleSummaryPress = () => {
    const { height } = Dimensions.get('window');

    const { isFullView } = this.state;

    this.setState(({ isFullView }) => {
      return {
        isFullView: !isFullView,
      };
    }, () => {
      Animated.spring(this.translateY, {
        toValue: (isFullView ? 0 : SUMMARY_HEIGHT - height * 0.8),
        useNativeDriver: true,
      }).start();
    });
  };

  handleTouchStart = () => {};

  handleTouchMove = (top: number) => {
    const { isFullView } = this.state;
    const offsetY = !isFullView ? top : (
      Math.max(0, top) + SUMMARY_HEIGHT - Dimensions.get('window').height * 0.8
    );
    this.translateY.setValue(offsetY);
  };

  handleTouchEnd = (top: number) => {
    const { isFullView } = this.state;

    const { height } = Dimensions.get('window');
    const maxOffset = SUMMARY_HEIGHT - height * 0.8;

    if (!isFullView && top < maxOffset * UP_GESTURE_QUALIFICATION_RATIO) {
      Animated.spring(this.translateY, {
        toValue: SUMMARY_HEIGHT - height * 0.8,
        useNativeDriver: true,
      }).start(() => {
        this.setState({ isFullView: true });
      });
    } else if (!isFullView && top > SUMMARY_HEIGHT * DOWN_GESTURE_QUALIFICATION_RATIO) {
      const { onDismiss } = this.props;
      onDismiss();
    } else {
      Animated.spring(this.translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start(() => {
        this.setState({ isFullView: false });
      });
    }
  };

  render() {
    const { height } = Dimensions.get('window');
    const positionStyle = {
      bottom: SUMMARY_HEIGHT - height * 0.8,
      height: height * 0.8,
    };

    const { site } = this.props;

    return (
      <Draggable
        onTouchStart={this.handleTouchStart}
        onTouchMove={({ top }) => this.handleTouchMove(top)}
        onTouchEnd={({ top }) => this.handleTouchEnd(top)}
      >
        {({ handlers }) => {
          const translateYStyle = {
            transform: [{ translateY: this.translateY }],
          };

          return (
            <Animated.View {...handlers} style={[styles.container, positionStyle, translateYStyle]}>
              <SiteSummary
                onPress={this.handleSummaryPress}
                site={site}
              />

              <ScrollView style={styles.scrollView}>
                
              </ScrollView>
            </Animated.View>
          );
        }}
      </Draggable>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${colors.white}`,
    borderRadius: 24,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  scrollView: {
    flex: 1,
  },
});
