import React, { Component } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { connect } from 'react-redux';
import { MapView } from 'expo';

import { actions as mapActions } from '../reducers/map';
import Fog from './Fog';
import Flights from './Flights';
import Countries from './Countries';
import CountryBorders from './CountryBorders';
import * as LocationUtils from '../utils/LocationUtils';
import * as Earth from '../constants/Earth';
import mapStyleLight from '../assets/mapStyleLight.json';
import mapStyleDark from '../assets/mapStyleDark.json';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

class Map extends Component {
  onRegionChangeComplete(region) {
    const { setRegion, setFollowLocation, geolocation } = this.props;

    region.longitudeDelta = region.longitudeDelta < 0 ? region.longitudeDelta + 360 : region.longitudeDelta;
    setRegion(region);

    if (
      Platform.OS === 'ios'
      && !LocationUtils.isCoordinateInRegion(geolocation.location, region)
    ) {
      setFollowLocation(false);
    }
  }

  moveToLocation(location) {
    this.map && this.map.animateToCoordinate(location, 500);
  }

  moveToCurrentLocation() {
    const { geolocation } = this.props;
    this.moveToRegion({
      latitude: geolocation.location.latitude,
      longitude: geolocation.location.longitude,
      latitudeDelta: Earth.DELTA,
      longitudeDelta: Earth.DELTA,
    });
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
      setFollowLocation,
      showFlights,
      showCountries,
      editMode,
      onMapPress,
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
        showsBuildings
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
        loadingEnabled
        moveOnMarkerPress={false}
        onRegionChangeComplete={newRegion => this.onRegionChangeComplete(newRegion)}
        onPanDrag={() => setFollowLocation(false)}
        onLongPress={event => onMapPress(event.nativeEvent.coordinate)}
      >
        <Fog />
        {showCountries && <Countries />}
        <CountryBorders />
        {(showFlights || editMode) && <Flights />}
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
  geolocation: state.map.get('geolocation'),
  editMode: state.map.get('editMode'),
  showFlights: state.map.get('showFlights'),
  showCountries: state.map.get('showCountries'),
});

const mapDispatchToProps = {
  setRegion: mapActions.setRegion,
  setMap: mapActions.setMap,
  setFollowLocation: mapActions.setFollowLocation,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Map);
