import React, { Component } from 'react';
import { TouchableWithoutFeedback, Animated } from 'react-native';

class TouchableScale extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scaleAnimation: new Animated.Value(1),
    };
  }

  onPressIn() {
    const { scaleAnimation } = this.state;
    const { scaleTo } = this.props;
    if (this.animation) this.animation.stop();
    Animated.timing(scaleAnimation, {
      toValue: scaleTo || 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }

  onPressOut() {
    const { scaleAnimation } = this.state;
    if (this.animation) this.animation.stop();
    Animated.timing(scaleAnimation, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }

  render() {
    const { style, children, onPress } = this.props;
    const { scaleAnimation } = this.state;

    return (
      <TouchableWithoutFeedback
        onPressIn={() => this.onPressIn()}
        onPressOut={() => this.onPressOut()}
        onPress={() => onPress()}
      >
        <Animated.View
          style={{
            ...style,
            transform: [
              {
                scale: scaleAnimation,
              },
            ],
          }}
        >
          {children}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}

export default TouchableScale;
