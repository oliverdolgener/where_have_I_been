import React, { Component } from 'react';
import { MapView } from 'expo';
import { connect } from 'react-redux';

import { actions as mapActions } from '../reducers/map';
import PlaceDialog from './PlaceDialog';
import iconMarker from '../assets/iconMarker.png';
import iconMarkerBig from '../assets/iconMarkerBig.png';

class Places extends Component {
  shouldComponentUpdate(prevProps) {
    const { places, marker } = this.props;
    return prevProps.places != places || marker != prevProps.marker;
  }

  render() {
    const {
      places, setMarker, os,
    } = this.props;
    const icon = os == 'android' ? iconMarkerBig : iconMarker;

    return places.map(x => (
      <MapView.Marker
        key={x.id.toString()}
        coordinate={x}
        image={icon}
        onPress={() => setMarker(x)}
        stopPropagation
      >
        <MapView.Callout tooltip>
          <PlaceDialog place={x} />
        </MapView.Callout>
      </MapView.Marker>
    ));
  }
}

const mapStateToProps = state => ({
  os: state.app.get('os'),
  places: state.map.get('places'),
  marker: state.map.get('marker'),
});

const mapDispatchToProps = {
  setMarker: mapActions.setMarker,
};

export default connect(mapStateToProps, mapDispatchToProps)(Places);
