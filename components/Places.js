import React, { Component } from 'react';
import { View } from 'react-native';
import { MapView } from 'expo';
import { connect } from 'react-redux';

import { actions as mapActions } from '../reducers/map';
import PlaceDialog from './PlaceDialog';
import iconMarker from '../assets/iconMarker.png';
import iconMarkerBig from '../assets/iconMarkerBig.png';
import * as Colors from '../constants/Colors';

class Places extends Component {
  shouldComponentUpdate(prevProps) {
    const { places, marker } = this.props;
    return prevProps.places != places || marker != prevProps.marker;
  }

  render() {
    const {
      places, setMarker, marker, os,
    } = this.props;
    const icon = os == 'android' ? iconMarkerBig : iconMarker;

    return (
      <View>
        {marker && <MapView.Circle center={marker} radius={75} strokeWidth={0} fillColor={Colors.rose50} />}
        {places.map(x => (
          <MapView.Marker
            key={x.id.toString()}
            coordinate={x}
            image={icon}
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
  os: state.app.get('os'),
  places: state.map.get('places'),
  marker: state.map.get('marker'),
});

const mapDispatchToProps = {
  setMarker: mapActions.setMarker,
};

export default connect(mapStateToProps, mapDispatchToProps)(Places);
