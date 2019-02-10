import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import geolib from 'geolib';
import moment from 'moment';

import StyledText from './StyledText';
import TouchableScale from './TouchableScale';
import * as Colors from '../constants/Colors';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: Colors.brown,
    borderWidth: 1,
    backgroundColor: Colors.creme,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 18,
  },
  distance: {
    fontSize: 16,
    fontFamily: 'light',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: Colors.brown,
    borderWidth: 1,
    marginTop: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 3,
    backgroundColor: Colors.rose,
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 20,
    color: Colors.creme,
  },
});

const Callout = (props) => {
  const {
    width, geolocation, location, title, button, timestamp,
  } = props;

  const formatDistance = (a, b) => {
    const distance = geolib.getDistance(a, b);
    if (distance >= 10000) {
      return `${Math.round(distance / 1000)} km`;
    }
    if (distance >= 1000) {
      return `${Math.round(distance / 100) / 10} km`;
    }
    return `${distance} m`;
  };

  const formatTime = time => moment(time).fromNow();

  return (
    <View style={[styles.container, { maxWidth: width * 0.8 }]}>
      <StyledText style={styles.title} ellipsizeMode="middle" numberOfLines={1}>
        {title}
      </StyledText>
      {geolocation
        && location && (
          <StyledText style={styles.distance}>{formatDistance(geolocation, location)}</StyledText>
      )}
      {timestamp && <StyledText style={styles.distance}>{formatTime(timestamp)}</StyledText>}
      {button && (
        <TouchableScale style={styles.button}>
          <StyledText style={styles.buttonLabel}>Been there!</StyledText>
        </TouchableScale>
      )}
    </View>
  );
};

const mapStateToProps = state => ({
  width: state.app.get('width'),
  geolocation: state.map.get('geolocation'),
});

export default connect(mapStateToProps)(Callout);
