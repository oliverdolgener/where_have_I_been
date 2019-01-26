import React, { Component } from 'react';
import { View } from 'react-native';
import { MapView } from 'expo';
import { connect } from 'react-redux';

import { actions as mapActions } from '../reducers/map';
import PlaceDialog from './PlaceDialog';
import iconMarker from '../assets/iconMarker.png';
import * as Colors from '../constants/Colors';

class Places extends Component {
  shouldComponentUpdate(prevProps) {
    const { places, marker } = this.props;
    return prevProps.places != places || marker != prevProps.marker;
  }

  render() {
    const { places, setMarker, marker } = this.props;

    return (
      <View>
        {marker && <MapView.Circle center={marker} radius={75} strokeWidth={0} fillColor={Colors.rose50} />}
        {places.map(x => (
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
        ))}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  places: state.map.get('places'),
  marker: state.map.get('marker'),
});

const mapDispatchToProps = {
  setMarker: mapActions.setMarker,
};

export default connect(mapStateToProps, mapDispatchToProps)(Places);
