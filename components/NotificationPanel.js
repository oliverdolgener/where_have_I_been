import React, { Component } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { connect } from 'react-redux';

import { actions as appActions } from '../reducers/app';
import TouchableScale from './TouchableScale';
import StyledText from './StyledText';
import * as Colors from '../constants/Colors';

const DURATION = 5000;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -300,
    left: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    maxWidth: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: Colors.brown,
    borderWidth: 1,
    padding: 10,
    backgroundColor: Colors.rose,
    elevation: 3,
  },
  message: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'light',
    color: Colors.creme,
  },
});

class NotificationPanel extends Component {
  constructor() {
    super();
    this.state = {
      message: '',
      animation: new Animated.Value(-300),
    };
  }

  componentDidMount() {
    const { setNotificationPanel } = this.props;
    setNotificationPanel(this);
  }

  slideDown() {
    const { animation } = this.state;
    if (this.animation) this.animation.stop();
    Animated.timing(animation, {
      toValue: 60,
      duration: 300,
    }).start();
  }

  slideUp() {
    const { animation } = this.state;
    if (this.animation) this.animation.stop();
    Animated.timing(animation, {
      toValue: -300,
      duration: 200,
    }).start();
  }

  show(message, duration = DURATION) {
    this.setState({ message });
    this.slideDown();
    duration > 0
      && setTimeout(() => {
        this.slideUp();
      }, duration);
  }

  hide() {
    this.slideUp();
  }

  render() {
    const { message, animation } = this.state;

    return (
      <Animated.View style={[styles.container, { top: animation }]}>
        <TouchableScale style={styles.panel} onPress={() => this.hide()}>
          <StyledText style={styles.message}>{message}</StyledText>
        </TouchableScale>
      </Animated.View>
    );
  }
}

const mapDispatchToProps = {
  setNotificationPanel: appActions.setNotificationPanel,
};

export default connect(
  null,
  mapDispatchToProps,
)(NotificationPanel);
