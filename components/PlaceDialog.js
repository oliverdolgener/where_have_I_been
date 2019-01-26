import React from 'react';
import { StyleSheet, View } from 'react-native';
import geolib from 'geolib';

import StyledText from './StyledText';
import * as Colors from '../constants/Colors';

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    borderRadius: 10,
    backgroundColor: Colors.creme,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 20,
  },
});

const PlaceDialog = (props) => {
  const { geolocation, place } = props;

  return (
    <View style={styles.container}>
      <StyledText style={styles.title}>{place.name}</StyledText>
      <StyledText>{`${geolib.getDistance(geolocation, place)} m`}</StyledText>
    </View>
  );
};


export default PlaceDialog;
