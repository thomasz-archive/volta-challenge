import React from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import { colors } from '../values/colors';
import { strings } from '../values/strings';
import { VoltaSite } from '../values/types';
import { Draggable } from './Draggable';
import { SiteSummary } from './SiteSummary';
import { HORIZONTAL_SPACE } from '../values/constants';

const SUMMARY_HEIGHT = 184;
const SWIPE_DOWN_TO_MINI_VIEW_RATIO = 0.2;
const SWIPE_UP_TO_FULL_VIEW_RATIO = 0.2;
const SWIPE_TO_DISMISS_RATIO = 0.35;

type Props = {
  isShowingFullSummary: boolean;
  onDismiss: () => void;
  onSiteSummaryPress: (isShowingFullSummary: boolean) => void;
  site: VoltaSite;
};

type State = {};

export class SiteInfoPane extends React.Component<Props, State> {
  translateY = new Animated.Value(0);

  componentWillReceiveProps(nextProps: Props) {
    const { isShowingFullSummary } = this.props;

    if (isShowingFullSummary !== nextProps.isShowingFullSummary) {
      this.showHideFullView(nextProps.isShowingFullSummary);
    }
  }

  handleSummaryPress = () => {
    const { isShowingFullSummary, onSiteSummaryPress } = this.props;

    this.showHideFullView(!isShowingFullSummary);

    onSiteSummaryPress(!isShowingFullSummary);
  };

  handleTouchStart = () => {};

  handleTouchMove = (top: number) => {
    const { isShowingFullSummary } = this.props;

    const { height } = Dimensions.get('window');
    const upGestureMaxOffset = SUMMARY_HEIGHT - height * 0.8;

    const offsetY = isShowingFullSummary
      ? Math.max(0, top) + upGestureMaxOffset
      : Math.max(top, upGestureMaxOffset);
    this.translateY.setValue(offsetY);
  };

  handleTouchEnd = (top: number) => {
    const { isShowingFullSummary, onSiteSummaryPress } = this.props;

    const { height } = Dimensions.get('window');
    const upGestureMaxOffset = SUMMARY_HEIGHT - height * 0.8;

    // in full view and the slide-down gesture isn't far enough to switch to the mini view
    if (
      isShowingFullSummary &&
      top < -upGestureMaxOffset * SWIPE_DOWN_TO_MINI_VIEW_RATIO
    ) {
      Animated.spring(this.translateY, {
        toValue: upGestureMaxOffset,
        useNativeDriver: true,
      }).start();

      // in mini view and the slide-up gesture is far enough to show the full view
    } else if (
      !isShowingFullSummary &&
      top < upGestureMaxOffset * SWIPE_UP_TO_FULL_VIEW_RATIO
    ) {
      onSiteSummaryPress(true);

      Animated.spring(this.translateY, {
        toValue: upGestureMaxOffset,
        useNativeDriver: true,
      }).start();

      // in mini view and the slide-down gesture is far enough to close the while view
    } else if (
      !isShowingFullSummary &&
      top > SUMMARY_HEIGHT * SWIPE_TO_DISMISS_RATIO
    ) {
      const { onDismiss } = this.props;
      onDismiss();

      // a full view -> a mini view, or a mini view stays unchanged
    } else {
      onSiteSummaryPress(false);

      Animated.spring(this.translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  showHideFullView = (shouldShowFullSummary: boolean) => {
    const { height } = Dimensions.get('window');

    Animated.spring(this.translateY, {
      toValue: shouldShowFullSummary ? SUMMARY_HEIGHT - height * 0.8 : 0,
      useNativeDriver: true,
    }).start();
  };

  render() {
    const { height } = Dimensions.get('window');
    const positionStyle = {
      bottom: SUMMARY_HEIGHT - height * 0.8,
      height: height * 0.8,
    };

    const { site } = this.props;

    /* prettier-ignore */
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

          /* prettier-ignore */
          return (
            <Animated.View
              {...handlers}
              style={[styles.container, positionStyle, translateYStyle]}
            >
              <SiteSummary
                onPress={this.handleSummaryPress}
                site={site}
              />

              <ScrollView style={styles.scrollView}>
                <Text style={styles.text}>{strings.emptySiteInfoDetail}</Text>
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
    marginHorizontal: HORIZONTAL_SPACE,
  },
  text: {
    color: `${colors.hint}`,
    lineHeight: 24,
  },
});
