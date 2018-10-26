import React from 'react';
import { MapView } from 'expo';
import { connect } from 'react-redux';

import * as Colors from '../constants/Colors';

const Flights = (props) => {
  const { flights } = props;
  return flights.map(x => (
    <MapView.Polyline
      key={x.id.toString()}
      coordinates={[
        { latitude: x.start_latitude, longitude: x.start_longitude },
        { latitude: x.destination_latitude, longitude: x.destination_longitude },
      ]}
      strokeColor={Colors.blue}
      strokeWidth={2}
      geodesic
    />
  ));
};

const mapStateToProps = state => ({
  flights: state.user.get('flights'),
});

export default connect(mapStateToProps)(Flights);
