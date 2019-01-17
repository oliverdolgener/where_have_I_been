import React, { Component } from 'react';
import {
  StyleSheet, View, Image, AsyncStorage,
} from 'react-native';
import { connect } from 'react-redux';
import { Location } from 'expo';
import geolib from 'geolib';
import { Box } from 'js-quadtree';

import { actions as userActions } from '../reducers/user';
import { actions as friendActions } from '../reducers/friend';
import { actions as mapActions } from '../reducers/map';
import { actions as flightActions } from '../reducers/flight';
import LatLng from '../model/LatLng';
import GeoLocation from '../model/GeoLocation';
import GeoArray from '../model/GeoArray';
import Speed from '../model/Speed';
import TouchableScale from '../components/TouchableScale';
import Toolbar from '../components/Toolbar';
import Map from '../components/Map';
import FlightBox from '../components/FlightBox';
import iconMenu from '../assets/iconMenu.png';
import iconLocation from '../assets/iconLocation.png';
import iconClose from '../assets/iconRemove.png';

const locationOptions = {
  accuracy: Location.Accuracy.BestForNavigation,
  timeInterval: 0,
  distanceInterval: 0,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 5,
  },
  menuImage: {
    width: 50,
    height: 50,
  },
  actionButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 30,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
  },
});

class MapScreen extends Component {
  constructor() {
    super();
    this.lastPosition = {
      lat: 0,
      lng: 0,
      time: 0,
    };
    this.speed = new Speed(5);
  }

  componentDidMount() {
    const { userId, getFlights, lastTile } = this.props;
    this.watchPositionAsync();
    this.startLocationUpdatesAsync();
    getFlights(userId);
    this.getGeocodeAsync(lastTile);
    this.onResume();
  }

  componentDidUpdate(prevProps) {
    const { appState } = this.props;
    if (prevProps.appState != 'active' && appState == 'active') {
      this.onResume();
    } else if (prevProps.appState == 'active' && appState != 'active') {
      this.onPause();
    }
  }

  async componentWillUnmount() {
    this.locationListener && this.locationListener.remove();
    await Location.stopLocationUpdatesAsync('location');
  }

  async onResume() {
    this.watchPositionAsync();
    await Location.stopLocationUpdatesAsync('location');
    const backgroundLocations = await AsyncStorage.getItem('backgroundLocations');
    if (backgroundLocations) {
      const locations = JSON.parse(backgroundLocations);
      if (locations.length > 0) {
        this.addLocations(locations);
        AsyncStorage.removeItem('backgroundLocations');
      }
    }
  }

  async onPause() {
    this.startLocationUpdatesAsync();
    this.locationListener && this.locationListener.remove();
  }

  onMapPress(coordinate) {
    const { editMode, quadtree } = this.props;
    if (!editMode) {
      return;
    }

    const location = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      timestamp: new Date().getTime(),
    };
    const roundedLocation = GeoLocation.getRoundedLocation(location);

    const point = LatLng.toPoint(roundedLocation);
    const box = new Box(point.x, point.y, 0, 0);
    const found = quadtree.query(box);

    if (found.length < 1) {
      this.addLocations([roundedLocation]);
    } else {
      this.removeLocation(roundedLocation);
    }
  }

  startLocationUpdatesAsync = async () => {
    await Location.startLocationUpdatesAsync('location', locationOptions);
  };

  getGeocodeAsync = async (location) => {
    const { setGeocode } = this.props;
    const geocode = await Location.reverseGeocodeAsync(location);
    geocode[0] && setGeocode(geocode[0]);
  };

  watchPositionAsync = async () => {
    this.locationListener = await Location.watchPositionAsync(locationOptions, (result) => {
      const { setGeolocation } = this.props;
      const {
        latitude, longitude, altitude, accuracy,
      } = result.coords;
      const { timestamp } = result;

      const location = {
        latitude,
        longitude,
        timestamp,
      };

      const currentPosition = { lat: latitude, lng: longitude, time: timestamp };
      const calculatedSpeed = geolib.getSpeed(this.lastPosition, currentPosition);
      if (calculatedSpeed >= 0 && calculatedSpeed <= 1000) {
        this.speed.addToBuffer(calculatedSpeed);
      }
      this.lastPosition = currentPosition;

      setGeolocation({
        latitude,
        longitude,
        speed: this.speed.getAverage(),
        altitude: Math.round(altitude),
        accuracy,
        timestamp,
      });

      if (accuracy < 50) {
        const {
          lastTile, setLastTile, followLocation, map,
        } = this.props;
        const roundedLocation = GeoLocation.getRoundedLocation(location);

        this.addLocations(GeoLocation.getCircleTiles(location, 0.0001, 16));

        if (!GeoLocation.isEqual(lastTile, roundedLocation)) {
          setLastTile(roundedLocation);
          followLocation && map && map.moveToLocation(roundedLocation);
          this.getGeocodeAsync(roundedLocation);
        }
      }
    });
  };

  addLocations(locations) {
    const {
      userId,
      quadtree,
      tilesToSave,
      setTilesToSave,
      saveTiles,
      setQuadtree,
      isSaving,
    } = this.props;

    const unsaved = [...tilesToSave];
    let count = 0;

    locations.forEach((x) => {
      const point = LatLng.toPoint(x);
      const box = new Box(point.x, point.y, 0, 0);
      const found = quadtree.query(box);

      if (found.length < 1) {
        count++;
        unsaved.push(x);
        quadtree.insert(point);
      }
    });

    if (count > 0) {
      setQuadtree(quadtree);
      setTilesToSave(unsaved);

      if (!isSaving) {
        saveTiles(userId, unsaved);
      }
    }
  }

  removeLocation(location) {
    const {
      userId, tilesToSave, setTilesToSave, quadtree, setQuadtree, removeTile,
    } = this.props;

    const point = LatLng.toPoint(location);
    const box = new Box(point.x, point.y, 0, 0);
    const found = quadtree.query(box);

    if (found.length > 0) {
      quadtree.remove(point);
      setQuadtree(quadtree);

      if (GeoArray.contains(location, tilesToSave)) {
        setTilesToSave(GeoArray.remove(location, tilesToSave));
      } else {
        removeTile(userId, location);
      }
    }
  }

  render() {
    const {
      navigation,
      friendQuadtree,
      resetFriend,
      followLocation,
      setFollowLocation,
      editMode,
    } = this.props;

    return (
      <View style={styles.container}>
        <Map onMapPress={coordinate => this.onMapPress(coordinate)} />
        <Toolbar />
        <TouchableScale style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Image style={styles.menuImage} source={iconMenu} />
        </TouchableScale>
        {friendQuadtree ? (
          <View style={styles.actionButton}>
            <TouchableScale onPress={() => resetFriend()}>
              <Image style={styles.actionIcon} source={iconClose} />
            </TouchableScale>
          </View>
        ) : (
          !followLocation && (
            <View style={styles.actionButton}>
              <TouchableScale onPress={() => setFollowLocation(true)}>
                <Image style={styles.actionIcon} source={iconLocation} />
              </TouchableScale>
            </View>
          )
        )}
        {editMode && <FlightBox />}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  appState: state.app.get('appState'),
  userId: state.user.get('userId'),
  quadtree: state.user.get('quadtree'),
  friendQuadtree: state.friend.get('friendQuadtree'),
  tilesToSave: state.user.get('tilesToSave'),
  isSaving: state.user.get('isSaving'),
  map: state.map.get('map'),
  lastTile: state.map.get('lastTile'),
  followLocation: state.map.get('followLocation'),
  editMode: state.map.get('editMode'),
});

const mapDispatchToProps = {
  setQuadtree: userActions.setQuadtree,
  setTilesToSave: userActions.setTilesToSave,
  saveTiles: userActions.saveTiles,
  removeTile: userActions.removeTile,
  resetFriend: friendActions.resetFriend,
  setLastTile: mapActions.setLastTile,
  setGeolocation: mapActions.setGeolocation,
  setGeocode: mapActions.setGeocode,
  setFollowLocation: mapActions.setFollowLocation,
  getFlights: flightActions.getFlights,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapScreen);
