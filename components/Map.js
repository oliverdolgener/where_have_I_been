import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { MapView } from 'expo';

import { actions as mapActions } from '../reducers/map';
import Fog from './Fog';
import Flights from './Flights';
import Countries from './Countries';
import Places from './Places';
import * as Earth from '../constants/Earth';
import * as Colors from '../constants/Colors';
import mapStyleLight from '../assets/mapStyleLight.json';
import mapStyleDark from '../assets/mapStyleDark.json';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

class Map extends Component {
  onRegionChangeComplete(region) {
    const { setRegion } = this.props;

    region.longitudeDelta = region.longitudeDelta < 0 ? region.longitudeDelta + 360 : region.longitudeDelta;
    setRegion(region);
  }

  moveToLocation(location) {
    this.map && this.map.animateToCoordinate(location, 500);
  }

  moveToRegion(region) {
    this.map && this.map.animateToRegion(region, 500);
  }

  render() {
    const {
      mapType,
      theme,
      lastTile,
      setMap,
      followLocation,
      setFollowLocation,
      showFlights,
      showCountries,
      editMode,
      onMapPress,
      setMarker,
      showPlaces,
      marker,
    } = this.props;

    return (
      <MapView
        ref={(ref) => {
          this.map = ref;
        }}
        key={`mapView-${theme}`}
        style={styles.container}
        provider="google"
        onMapReady={() => setMap(this)}
        initialRegion={{
          latitude: lastTile.latitude,
          longitude: lastTile.longitude,
          latitudeDelta: Earth.DELTA,
          longitudeDelta: Earth.DELTA,
        }}
        mapType={mapType}
        customMapStyle={theme === 'dark' ? mapStyleDark : mapStyleLight}
        showsUserLocation
        showsMyLocationButton={false}
        showsPointsOfInterest
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        showsIndoorLevelPicker={false}
        zoomEnabled
        zoomControlEnabled={false}
        minZoomLevel={0}
        maxZoomLevel={18}
        rotateEnabled={false}
        scrollEnabled
        pitchEnabled={false}
        toolbarEnabled={false}
        loadingEnabled={false}
        moveOnMarkerPress
        onRegionChangeComplete={newRegion => this.onRegionChangeComplete(newRegion)}
        onPanDrag={() => followLocation && setFollowLocation(false)}
        onLongPress={event => onMapPress(event.nativeEvent.coordinate)}
        onPress={() => setMarker(false)}
      >
        {!showCountries && <Fog />}
        {showCountries && <Countries />}
        {(showFlights || editMode) && <Flights />}
        {showPlaces && <Places />}
        {marker && <MapView.Circle center={marker} radius={75} strokeWidth={0} fillColor={Colors.rose50} />}
      </MapView>
    );
  }
}

const mapStateToProps = state => ({
  region: state.map.get('region'),
  lastTile: state.map.get('lastTile'),
  mapType: state.map.get('mapType'),
  theme: state.map.get('theme'),
  followLocation: state.map.get('followLocation'),
  editMode: state.map.get('editMode'),
  showPlaces: state.map.get('showPlaces'),
  marker: state.map.get('marker'),
  showCountries: state.country.get('showCountries'),
  showFlights: state.flight.get('showFlights'),
});

const mapDispatchToProps = {
  setRegion: mapActions.setRegion,
  setMap: mapActions.setMap,
  setFollowLocation: mapActions.setFollowLocation,
  setMarker: mapActions.setMarker,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Map);
