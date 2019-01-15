import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';

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
      <Text style={styles.country} ellipsizeMode="middle" numberOfLines={1}>
        {geocode.country}
      </Text>
      <Text style={styles.region} ellipsizeMode="middle" numberOfLines={1}>
        {geocode.region}
      </Text>
      <Text style={styles.city} ellipsizeMode="middle" numberOfLines={1}>
        {geocode.city}
      </Text>
    </View>
  );
};

const mapStateToProps = state => ({
  geocode: state.map.get('geocode'),
});

export default connect(mapStateToProps)(Geocode);
