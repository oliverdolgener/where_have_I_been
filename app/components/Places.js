import React, { Component } from 'react';
import { connect } from 'react-redux';
import MapView from 'react-native-maps';

import { actions as mapActions } from '../reducers/map';
import Callout from './Callout';

class Places extends Component {
  shouldComponentUpdate(prevProps) {
    const { places, marker } = this.props;
    return prevProps.places != places || marker != prevProps.marker;
  }

  render() {
    const { places, setMarker } = this.props;

    return places.map(x => (
      <MapView.Marker
        key={x.id.toString()}
        coordinate={x.location}
        onPress={() => setMarker(x)}
        stopPropagation
      >
        <MapView.Callout tooltip>
          <Callout location={x.location} title={x.name} button />
        </MapView.Callout>
      </MapView.Marker>
    ));
  }
}

const mapStateToProps = state => ({
  places: state.map.get('places'),
  marker: state.map.get('marker'),
});

const mapDispatchToProps = {
  setMarker: mapActions.setMarker,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Places);
