import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import StyledText from './StyledText';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  country: {
    fontSize: 20,
    textAlign: 'right',
    fontFamily: 'light',
  },
  region: {
    fontSize: 18,
    textAlign: 'right',
    fontFamily: 'light',
  },
  city: {
    fontSize: 16,
    textAlign: 'right',
    fontFamily: 'light',
  },
});

const Geocode = (props) => {
  const { geocode } = props;
  return (
    <View style={styles.container}>
      <StyledText style={styles.country} ellipsizeMode="middle" numberOfLines={1}>
        {geocode.country}
      </StyledText>
      <StyledText style={styles.region} ellipsizeMode="middle" numberOfLines={1}>
        {geocode.region}
      </StyledText>
      <StyledText style={styles.city} ellipsizeMode="middle" numberOfLines={1}>
        {geocode.city}
      </StyledText>
    </View>
  );
};

const mapStateToProps = state => ({
  geocode: state.map.get('geocode'),
});

export default connect(mapStateToProps)(Geocode);
