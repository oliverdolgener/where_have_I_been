import React, { Component } from 'react';
import { Platform } from 'react-native';
import { connect } from 'react-redux';
import { Location, Permissions, MapView } from 'expo';

import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
import Coordinate from '../model/Coordinate';
import * as MathUtils from '../utils/MathUtils';
import * as EarthUtils from '../utils/EarthUtils';
import * as Earth from '../constants/Earth';
import * as Colors from '../constants/Colors';
import mapStyleLight from '../assets/mapStyleLight.json';
import mapStyleDark from '../assets/mapStyleDark.json';

const styles = {
  container: {
    flex: 1,
  },
};

class Map extends Component {
  componentDidMount() {
    const { lastTile, onRef } = this.props;
    this.watchPositionAsync();
    this.getGeocodeAsync(lastTile);
    onRef(this);
  }

  onTileChange(tile) {
    const { setLastTile, geolocation, followLocation } = this.props;
    setLastTile(tile);
    this.addLocation(tile);
    this.getGeocodeAsync(geolocation.location);
    followLocation && this.moveToLocation(tile);
  }

  onRegionChangeComplete(region) {
    const { setRegion, setFollowLocation, geolocation } = this.props;

    region.longitudeDelta = region.longitudeDelta < 0 ? region.longitudeDelta + 360 : region.longitudeDelta;
    setRegion(region);

    if (Platform.OS === 'ios' && !EarthUtils.isCoordinateInRegion(geolocation.location, region)) {
      setFollowLocation(false);
    }
  }

  getGeocodeAsync = async (location) => {
    const { setGeocode } = this.props;
    await Permissions.askAsync(Permissions.LOCATION);
    const geocode = await Location.reverseGeocodeAsync(location);
    setGeocode(geocode[0]);
  };

  watchPositionAsync = async () => {
    await Permissions.askAsync(Permissions.LOCATION);
    this.positionListener = await Location.watchPositionAsync(
      { enableHighAccuracy: true, timeInterval: 0, distanceInterval: 0 },
      (result) => {
        const { setGeolocation } = this.props;
        const {
          latitude, longitude, speed, altitude, accuracy,
        } = result.coords;
        const { timestamp } = result;

        setGeolocation({
          location: new Coordinate(latitude, longitude),
          speed: Math.round(MathUtils.toKmh(speed)),
          altitude: Math.round(altitude),
          accuracy,
          timestamp,
        });

        const location = new Coordinate(latitude, longitude);

        if (accuracy < 50) {
          const { lastTile } = this.props;
          const roundedLocation = new Coordinate(
            location.getRoundedLatitude(),
            location.getRoundedLongitude(),
            timestamp,
          );

          if (!Coordinate.isEqual(lastTile, roundedLocation)) {
            this.onTileChange(roundedLocation);
          }
        }
      },
    );
  };

  addLocation(location) {
    const {
      userId,
      tilesToSave,
      setTilesToSave,
      saveTiles,
      visitedLocations,
      setLocations,
      isSaving,
    } = this.props;

    if (!MathUtils.isLocationInGrid(location, visitedLocations)) {
      const unsaved = [...tilesToSave, location];
      const locations = MathUtils.gridToArray(visitedLocations);
      const visited = [...locations, location];
      setTilesToSave(unsaved);
      setLocations(visited);

      if (!isSaving) {
        saveTiles(userId, unsaved);
      }
    }
  }

  moveToLocation(location) {
    this.map && this.map.animateToCoordinate(location, 500);
  }

  moveToCurrentLocation() {
    const { geolocation } = this.props;
    this.moveToLocation(geolocation.location);
  }

  render() {
    const {
      isLoggedIn, mapType, holes, theme, lastTile, setFollowLocation,
    } = this.props;

    if (!isLoggedIn && this.positionListener) {
      this.positionListener.remove();
    }

    return (
      <MapView
        ref={(ref) => {
          this.map = ref;
        }}
        key={`mapView-${theme}`}
        style={styles.container}
        provider="google"
        initialRegion={{
          latitude: lastTile.latitude,
          longitude: lastTile.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        mapType={mapType === 'watercolor' ? 'none' : mapType}
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
      >
        {mapType === 'watercolor' && (
          <MapView.UrlTile
            urlTemplate="http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg"
            zIndex={-1}
          />
        )}
        <MapView.Polygon
          fillColor={Colors.black80}
          strokeWidth={0}
          strokeColor={Colors.transparent}
          coordinates={Earth.FOG}
          holes={holes}
        />
      </MapView>
    );
  }
}

const mapStateToProps = state => ({
  userId: state.user.get('userId'),
  region: state.user.get('region'),
  visitedLocations: state.user.get('visitedLocations'),
  holes: state.user.get('holes'),
  isLoggedIn: state.user.get('isLoggedIn'),
  mapType: state.user.get('mapType'),
  tilesToSave: state.user.get('tilesToSave'),
  theme: state.user.get('theme'),
  lastTile: state.user.get('lastTile'),
  isSaving: state.user.get('isSaving'),
  followLocation: state.map.get('followLocation'),
  geolocation: state.map.get('geolocation'),
});

const mapDispatchToProps = {
  setLocations: userActions.setLocations,
  setRegion: userActions.setRegion,
  setTilesToSave: userActions.setTilesToSave,
  saveTiles: userActions.saveTiles,
  setLastTile: userActions.setLastTile,
  setGeolocation: mapActions.setGeolocation,
  setGeocode: mapActions.setGeocode,
  setFollowLocation: mapActions.setFollowLocation,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Map);
