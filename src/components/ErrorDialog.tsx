import React from 'react';
import {
  Animated,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Color from 'color';

type Props = {
  autoDismissInterval?: number;
  backgroundColor: Color;
  error?: string;
  onDismiss: () => void;
  style?: StyleProp<ViewStyle>;
  tintColor: Color;
  visible: boolean;
};

type State = {};

export class ErrorDialog extends React.Component<Props, State> {
  intervalId: number;
  opacity = new Animated.Value(0);

  componentDidMount() {
    this.showErrorDialog();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.error) this.showErrorDialog();
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  showErrorDialog = () => {
    Animated.timing(this.opacity, {
      duration: 350,
      toValue: 1,
      useNativeDriver: true,
    }).start(() => {
      this.startTimer();
    });
  };

  startTimer = () => {
    const { autoDismissInterval, onDismiss } = this.props;

    if (autoDismissInterval && autoDismissInterval > 0) {
      this.stopTimer();

      this.intervalId = window.setInterval(() => {
        onDismiss();
      }, autoDismissInterval);
    }
  };

  stopTimer = () => {
    if (this.intervalId) window.clearInterval(this.intervalId);
  };

  render() {
    const {
      backgroundColor,
      onDismiss,
      error,
      style,
      tintColor,
      visible,
    } = this.props;

    if (!error || !visible) return null;

    const dynamicStyle = {
      backgroundColor: `${backgroundColor}`,
      opacity: this.opacity,
    };

    const tintStyle = {
      color: `${tintColor}`,
    };

    /* prettier-ignore */
    return (
      <Animated.View style={[styles.container, style, dynamicStyle]}>
        <Text style={[styles.errorText, tintStyle]}>{error}</Text>

        <View style={styles.iconContainer}>
          <MaterialIcons
            name="close"
            size={24}
            onPress={onDismiss}
            style={tintStyle}
          />
        </View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    position: 'absolute',
    zIndex: 1,
  },
  iconContainer: {
    marginLeft: 8,
  },
  errorText: {
    flex: 1,
    lineHeight: 22,
  },
});
