import React from 'react';
import {
  StyleSheet, View, Text, Image,
} from 'react-native';
import { connect } from 'react-redux';
import ProgressBar from 'react-native-progress/Bar';

import * as LevelUtils from '../utils/LevelUtils';
import * as LocationUtils from '../utils/LocationUtils';
import * as Colors from '../constants/Colors';
import iconLevel from '../assets/iconLevel.png';
import iconSquare from '../assets/iconSquare.png';
import iconSpeed from '../assets/iconSpeed.png';
import iconAltitude from '../assets/iconAltitude.png';

const styles = StyleSheet.create({
  container: {},
  toolbar: {
    width: '100%',
    height: 30,
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
  },
  separator: {
    height: '100%',
    borderWidth: 0.5,
    borderColor: Colors.black,
  },
});

const Toolbar = (props) => {
  const { visitedLocations, geolocation } = props;

  const locations = LocationUtils.gridToArray(visitedLocations);
  const level = LevelUtils.getLevelFromExp(locations.length);
  const progress = LevelUtils.getPercentToNextLevel(locations.length);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.toolbarItem}>
          <Image style={styles.toolbarIcon} source={iconLevel} />
          <Text style={styles.toolbarLabel}>{level}</Text>
        </View>
        <View style={styles.separator} />
        <View style={[styles.toolbarItem, { flex: 5 }]}>
          <Image style={styles.toolbarIcon} source={iconSquare} />
          <Text style={styles.toolbarLabel}>{locations.length}</Text>
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
        height={5}
        borderRadius={0}
        borderWidth={0}
        unfilledColor={Colors.creme}
        color={Colors.blue}
        useNativeDriver
      />
    </View>
  );
};

const mapStateToProps = state => ({
  visitedLocations: state.user.get('visitedLocations'),
  geolocation: state.map.get('geolocation'),
});

export default connect(mapStateToProps)(Toolbar);
