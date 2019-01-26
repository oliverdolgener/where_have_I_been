import React, { Component } from 'react';
import { MapView } from 'expo';
import { connect } from 'react-redux';

import { actions as mapActions } from '../reducers/map';
import PlaceDialog from './PlaceDialog';
import iconMarker from '../assets/iconMarker.png';

class Places extends Component {
  shouldComponentUpdate(prevProps) {
    const { places } = this.props;
    return prevProps.places != places;
  }

  render() {
    const { places, setMarker } = this.props;

    return places.map(x => (
      <MapView.Marker
        key={x.id.toString()}
        coordinate={x}
        image={iconMarker}
        onPress={() => setMarker(x)}
      >
        <MapView.Callout tooltip>
          <PlaceDialog place={x} />
        </MapView.Callout>
      </MapView.Marker>
    ));
  }
}

const mapStateToProps = state => ({
  places: state.map.get('places'),
});

const mapDispatchToProps = {
  setMarker: mapActions.setMarker,
};

export default connect(mapStateToProps, mapDispatchToProps)(Places);
