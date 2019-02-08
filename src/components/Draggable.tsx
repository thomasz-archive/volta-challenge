import React from 'react';
import {
  GestureResponderEvent,
  GestureResponderHandlers,
  PanResponder,
  PanResponderGestureState,
  PanResponderInstance,
} from 'react-native';

type GestureOffset = {
  top: number;
  left: number;
};

type DraggableChildrenArgs = {
  dragging: boolean;
  handlers: GestureResponderHandlers;
};

type OriginalProps = {
  children: (args: DraggableChildrenArgs) => JSX.Element[] | JSX.Element;
  enabled?: boolean;
  onTouchStart: () => void;
  onTouchMove: (offset: GestureOffset) => void;
  onTouchEnd: (offset: GestureOffset) => void;
};
const DEFAULT_PROPS = {
  enabled: true,
};
type Props = OriginalProps & typeof DEFAULT_PROPS;

type State = {
  dragging: boolean;
};

export class Draggable extends React.Component<Props, State> {
  static defaultProps = DEFAULT_PROPS;

  panResponder: PanResponderInstance;

  constructor(props: Props) {
    super(props);

    this.state = {
      dragging: false,
    };

    /* prettier-ignore */
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
      onPanResponderGrant: this.handlePanResponderGrant,
      onMoveShouldSetPanResponderCapture: this.handleMoveShouldSetPanResponderCapture,
      onPanResponderMove: this.handlePanResponderMove,
      onPanResponderRelease: this.handlePanResponderEnd,
      onPanResponderTerminate: this.handlePanResponderEnd,
    });
  }

  handleStartShouldSetPanResponder = () => {
    const { enabled } = this.props;

    return enabled;
  };

  handlePanResponderGrant = () => {
    const { onTouchStart } = this.props;

    this.setState(
      {
        dragging: true,
      },
      () => onTouchStart()
    );
  };

  handleMoveShouldSetPanResponderCapture = (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => gestureState.dx !== 0 && gestureState.dy !== 0;

  handlePanResponderMove = (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    const { onTouchMove } = this.props;

    const offset = {
      left: gestureState.dx,
      top: gestureState.dy,
    };

    onTouchMove(offset);
  };

  handlePanResponderEnd = (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    const { onTouchMove, onTouchEnd } = this.props;

    const offset = {
      left: gestureState.dx,
      top: gestureState.dy,
    };

    this.setState(
      {
        dragging: false,
      },
      () => {
        onTouchMove(offset);
        onTouchEnd(offset);
      }
    );
  };

  render() {
    const { children } = this.props;
    const { dragging } = this.state;

    return children({
      dragging,
      handlers: this.panResponder.panHandlers,
    });
  }
}
