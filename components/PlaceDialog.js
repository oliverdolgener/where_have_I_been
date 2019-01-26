import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import geolib from 'geolib';

import StyledText from './StyledText';
import * as Colors from '../constants/Colors';

const styles = StyleSheet.create({
  container: {
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
});

class PlaceDialog extends Component {
  shouldComponentUpdate() {
    const { marker, place } = this.props;
    return marker == place;
  }

  render() {
    const { geolocation, place, width } = this.props;
    const distance = geolib.getDistance(geolocation, place);

    return (
      <View style={[styles.container, { maxWidth: width * 0.8 }]}>
        <StyledText style={styles.title} ellipsizeMode="middle" numberOfLines={1}>{place.name}</StyledText>
        <StyledText style={styles.distance}>{`${distance} m`}</StyledText>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  width: state.app.get('width'),
  geolocation: state.map.get('geolocation'),
  marker: state.map.get('marker'),
});

export default connect(mapStateToProps)(PlaceDialog);
