import React, { Component } from 'react';
import { Platform } from 'react-native';
import { connect } from 'react-redux';
import { MapView } from 'expo';

import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
import Fog from './Fog';
import Flights from './Flights';
import Countries from './Countries';
import * as LocationUtils from '../utils/LocationUtils';
import mapStyleLight from '../assets/mapStyleLight.json';
import mapStyleDark from '../assets/mapStyleDark.json';

const styles = {
  container: {
    flex: 1,
  },
};

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
    this.moveToLocation(geolocation.location);
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
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
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
        onRegionChangeComplete={newRegion => this.onRegionChangeComplete(newRegion)}
        onPanDrag={() => setFollowLocation(false)}
        onLongPress={event => onMapPress(event.nativeEvent.coordinate)}
      >
        <Fog />
        {showCountries && <Countries />}
        {(showFlights || editMode) && <Flights />}
      </MapView>
    );
  }
}

const mapStateToProps = state => ({
  region: state.user.get('region'),
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
  setRegion: userActions.setRegion,
  setMap: mapActions.setMap,
  setFollowLocation: mapActions.setFollowLocation,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Map);
