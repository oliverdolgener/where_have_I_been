import React from 'react';
import { View } from 'react-native';
import { MapView } from 'expo';
import { connect } from 'react-redux';

import { containsLocation } from '../utils/LocationUtils';
import * as Colors from '../constants/Colors';

const Flights = (props) => {
  const { flights, friendFlights } = props;
  const visibleFlights = friendFlights || flights;

  const airports = [];
  for (let i = 0; i < visibleFlights.length; i++) {
    const start = {
      latitude: visibleFlights[i].start_latitude,
      longitude: visibleFlights[i].start_longitude,
      code: visibleFlights[i].start_code,
    };
    const destination = {
      latitude: visibleFlights[i].destination_latitude,
      longitude: visibleFlights[i].destination_longitude,
      code: visibleFlights[i].destination_code,
    };
    if (!containsLocation(start, airports)) {
      airports.push(start);
    }
    if (!containsLocation(destination, airports)) {
      airports.push(destination);
    }
  }

  return (
    <View>
      {visibleFlights.map(x => (
        <MapView.Polyline
          key={x.id.toString()}
          coordinates={[
            { latitude: x.start_latitude, longitude: x.start_longitude },
            { latitude: x.destination_latitude, longitude: x.destination_longitude },
          ]}
          strokeColor={Colors.blue}
          strokeWidth={1}
          geodesic
        />))}
      {airports.map(x => (
        <MapView.Marker
          key={x.code}
          coordinate={x}
          title={x.code}
          pinColor={Colors.blue}
        />
      ))}
    </View>
  );
};

const mapStateToProps = state => ({
  flights: state.user.get('flights'),
  friendFlights: state.user.get('friendFlights'),
});

export default connect(mapStateToProps)(Flights);
