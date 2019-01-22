import React, { Component } from 'react';
import {
  StyleSheet, Animated, View,
} from 'react-native';
import { connect } from 'react-redux';

import StyledText from './StyledText';
import * as Colors from '../constants/Colors';

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
    backgroundColor: Colors.creme,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: Colors.brown,
    borderWidth: 1,
    padding: 10,
  },
  message: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'light',
  },
});

class Toolbar extends Component {
  constructor() {
    super();
    this.state = {
      animation: new Animated.Value(-300),
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.slideDown();
    }, 5000);
    setTimeout(() => {
      this.slideUp();
    }, 10000);
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

  render() {
    const { animation } = this.state;
    const { username } = this.props;

    return (
      <Animated.View style={[styles.container, { top: animation }]}>
        <View style={styles.panel}>
          <StyledText style={styles.message}>
            {`Willkommen zurück, ${username}!`}
          </StyledText>
        </View>
      </Animated.View>
    );
  }
}

const mapStateToProps = state => ({
  username: state.user.get('username'),
});

export default connect(mapStateToProps)(Toolbar);
