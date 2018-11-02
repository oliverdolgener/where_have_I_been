import React from 'react';
import { MapView } from 'expo';
import { connect } from 'react-redux';

import * as Colors from '../constants/Colors';

const Flights = (props) => {
  const { flights, friendFlights } = props;
  const visibleFlights = friendFlights || flights;
  return visibleFlights.map(x => (
    <MapView.Polyline
      key={x.id.toString()}
      coordinates={[
        { latitude: x.start_latitude, longitude: x.start_longitude },
        { latitude: x.destination_latitude, longitude: x.destination_longitude },
      ]}
      strokeColor={Colors.blue}
      strokeWidth={1}
      geodesic
    />
  ));
};

const mapStateToProps = state => ({
  flights: state.user.get('flights'),
  friendFlights: state.user.get('friendFlights'),
});

export default connect(mapStateToProps)(Flights);
