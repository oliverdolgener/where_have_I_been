import React from 'react';
import { View, Image } from 'react-native';
import { MapView } from 'expo';
import { connect } from 'react-redux';

import * as Colors from '../constants/Colors';
import iconMarker from '../assets/iconMarker.png';

const Flights = (props) => {
  const { flights, friendFlights } = props;
  const visibleFlights = friendFlights || flights;
  return visibleFlights.map(x => (
    <View key={x.id.toString()}>
      <MapView.Polyline
        coordinates={[
          { latitude: x.start_latitude, longitude: x.start_longitude },
          { latitude: x.destination_latitude, longitude: x.destination_longitude },
        ]}
        strokeColor={Colors.blue}
        strokeWidth={1}
        geodesic
      />
      <MapView.Marker
        coordinate={{ latitude: x.start_latitude, longitude: x.start_longitude }}
        title={x.start_code}
      >
        <Image source={iconMarker} style={{ width: 40, height: 40 }} />
      </MapView.Marker>
      <MapView.Marker
        coordinate={{ latitude: x.destination_latitude, longitude: x.destination_longitude }}
        title={x.destination_code}
      >
        <Image source={iconMarker} style={{ width: 40, height: 40 }} />
      </MapView.Marker>
    </View>
  ));
};

const mapStateToProps = state => ({
  flights: state.user.get('flights'),
  friendFlights: state.user.get('friendFlights'),
});

export default connect(mapStateToProps)(Flights);
