import React from 'react';
import { MapView } from 'expo';
import { connect } from 'react-redux';

import PlaceDialog from './PlaceDialog';
import iconMarker from '../assets/iconMarker.png';

const Places = (props) => {
  const { places, geolocation } = props;

  return places.map(x => (
    <MapView.Marker
      key={x.id.toString()}
      coordinate={x}
      image={iconMarker}
    >
      <MapView.Callout tooltip>
        <PlaceDialog geolocation={geolocation} place={x} />
      </MapView.Callout>
    </MapView.Marker>
  ));
};

const mapStateToProps = state => ({
  places: state.map.get('places'),
  geolocation: state.map.get('geolocation'),
});

export default connect(mapStateToProps)(Places);
