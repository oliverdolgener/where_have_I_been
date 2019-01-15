import React, { Component } from 'react';
import {
  StyleSheet, Animated, View, Text, Image,
} from 'react-native';
import { connect } from 'react-redux';
import ProgressBar from 'react-native-progress/Bar';

import * as LevelUtils from '../utils/LevelUtils';
import * as Colors from '../constants/Colors';
import iconLevel from '../assets/iconLevel.png';
import iconSquare from '../assets/iconSquare.png';
import iconSpeed from '../assets/iconSpeed.png';
import iconAltitude from '../assets/iconAltitude.png';

const TOOLBAR_HEIGHT = 30;
const PROGRESS_HEIGHT = 5;
const HEIGHT = TOOLBAR_HEIGHT + PROGRESS_HEIGHT;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
  },
  toolbar: {
    height: TOOLBAR_HEIGHT,
    backgroundColor: Colors.creme,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  toolbarItem: {
    flex: 3,
    flexDirection: 'row',
  },
  toolbarIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  toolbarLabel: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    marginRight: 10,
    fontFamily: 'regular',
  },
  separator: {
    height: '100%',
    borderWidth: 0.5,
    borderColor: Colors.black,
  },
});

class Toolbar extends Component {
  constructor() {
    super();
    this.state = {
      animation: new Animated.Value(0),
    };
  }

  componentDidUpdate(prevProps) {
    const { followLocation } = this.props;
    if (prevProps.followLocation && !followLocation) {
      this.slideDown();
    } else if (!prevProps.followLocation && followLocation) {
      this.slideUp();
    }
  }

  slideDown() {
    const { animation } = this.state;
    if (this.animation) this.animation.stop();
    Animated.timing(animation, {
      toValue: -HEIGHT,
      duration: 250,
    }).start();
  }

  slideUp() {
    const { animation } = this.state;
    if (this.animation) this.animation.stop();
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
    }).start();
  }

  render() {
    const { count, geolocation } = this.props;
    const { animation } = this.state;

    const level = LevelUtils.getLevelFromExp(count);
    const progress = LevelUtils.getPercentToNextLevel(count);

    return (
      <Animated.View style={[styles.container, { bottom: animation }]}>
        <View style={styles.toolbar}>
          <View style={styles.toolbarItem}>
            <Image style={styles.toolbarIcon} source={iconLevel} />
            <Text style={styles.toolbarLabel}>{level}</Text>
          </View>
          <View style={styles.separator} />
          <View style={[styles.toolbarItem, { flex: 5 }]}>
            <Image style={styles.toolbarIcon} source={iconSquare} />
            <Text style={styles.toolbarLabel}>{count}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.toolbarItem}>
            <Image style={styles.toolbarIcon} source={iconSpeed} />
            <Text style={styles.toolbarLabel}>{geolocation.speed || 0}</Text>
          </View>
          <View style={styles.separator} />
          <View style={[styles.toolbarItem, { flex: 4 }]}>
            <Image style={styles.toolbarIcon} source={iconAltitude} />
            <Text style={styles.toolbarLabel}>{geolocation.altitude || 0}</Text>
          </View>
        </View>
        <ProgressBar
          progress={progress}
          width={null}
          height={PROGRESS_HEIGHT}
          borderRadius={0}
          borderWidth={0}
          unfilledColor={Colors.creme}
          color={Colors.blue}
          useNativeDriver
        />
      </Animated.View>
    );
  }
}

const mapStateToProps = state => ({
  count: state.user.get('count'),
  geolocation: state.map.get('geolocation'),
  followLocation: state.map.get('followLocation'),
});

export default connect(mapStateToProps)(Toolbar);
