import React, { Component } from 'react';
import {
  StyleSheet, View, Image, AsyncStorage,
} from 'react-native';
import { connect } from 'react-redux';
import { Location } from 'expo';
import geolib from 'geolib';
import { Box } from 'js-quadtree';
import BackgroundGeolocation from 'react-native-background-geolocation';

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

const GEOCODE_INTERVAL = 20000;
const ELEVATION_INTERVAL = 30000;
const PLACES_INTERVAL = 60000;
const FRIEND_INTERVAL = 10000;

const locationOptions = {
  accuracy: 4,
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

  componentWillMount() {
    // BackgroundGeolocation.onLocation(this.onLocation);
    BackgroundGeolocation.ready({
      reset: true,

      // Geolocation Common Options
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 0,
      disableElasticity: true,

      // Geolocation iOS Options

      // Geolocation Android Options
      locationUpdateInterval: 1000,
      fastestLocationUpdateInterval: 1000,
      allowIdenticalLocations: true,

      // Activity Recognition Common Options
      activityRecognitionInterval: 1000,
      stopTimeout: 60,
      minimumActivityRecognitionConfidence: 0,
      disableStopDetection: true,

      // Application Common Options
      stopOnTerminate: true,
      startOnBoot: false,
      heartbeatInterval: 60,

      // Application Android Options
      foregroundService: true,

      // Logging & Debug Options
      debug: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
    }, (state) => {
      if (!state.enabled) {
        BackgroundGeolocation.start(() => {
          console.log('- Start success');
        });
      }
    });
  }

  componentDidMount() {
    const { userId, getFlights } = this.props;
    getFlights(userId);
    this.onResume();
    setTimeout(() => {
      const { notificationPanel, username } = this.props;
      notificationPanel && notificationPanel.show(`Welcome back, ${username}!`);
    }, 5000);
  }

  componentDidUpdate(prevProps) {
    const { appState } = this.props;
    if (prevProps.appState != 'active' && appState == 'active') {
      this.onResume();
    } else if (prevProps.appState == 'active' && appState != 'active') {
      this.onPause();
    }
  }

  componentWillUnmount() {
    this.stopForegroundLocations();
    // this.stopBackgroundLocations();
    this.stopGeocode();
    this.stopElevation();
    this.stopPlaces();
    this.stopFriends();

    BackgroundGeolocation.removeListeners();
  }

  onResume() {
    this.startForegroundLocations();
    // this.stopBackgroundLocations();
    this.startGeocode();
    this.startElevation();
    this.startPlaces();
    this.startFriends();
    this.restoreBackgroundLocations();
  }

  onPause() {
    const { backgroundTracking } = this.props;
    // this.startBackgroundLocations();
    backgroundTracking === 'off' && this.stopForegroundLocations();
    this.stopGeocode();
    this.stopElevation();
    this.stopPlaces();
    this.stopFriends();
  }

  onLocation(event) {
    const { setGeolocation } = this.props;
    const {
      latitude, longitude, altitude, accuracy,
    } = event.coords;
    const { timestamp } = event.extras;

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

    if (accuracy < 100) {
      const {
        userId, lastTile, setLastTile, saveLastTile, followLocation, map,
      } = this.props;
      const roundedLocation = GeoLocation.getRoundedLocation(location);

      if (!GeoLocation.isEqual(lastTile, roundedLocation)) {
        this.addLocations([roundedLocation]);
        setLastTile(roundedLocation);
        saveLastTile(userId, roundedLocation);
        followLocation && map && map.moveToLocation(roundedLocation);
      }
    }
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

  startForegroundLocations = () => {
    // this.watchPositionAsync();
    BackgroundGeolocation.watchPosition(location => this.onLocation(location));
  };

  stopForegroundLocations = () => {
    // this.locationListener && this.locationListener.remove();
    BackgroundGeolocation.stopWatchPosition();
  };

  startBackgroundLocations = async () => {
    await Location.startLocationUpdatesAsync('location', locationOptions);
  };

  stopBackgroundLocations = async () => {
    (await Location.hasStartedLocationUpdatesAsync('location'))
      && (await Location.stopLocationUpdatesAsync('location'));
  };

  restoreBackgroundLocations = async () => {
    const backgroundLocations = await AsyncStorage.getItem('backgroundLocations');
    if (backgroundLocations) {
      const locations = JSON.parse(backgroundLocations);
      if (locations.length > 0) {
        this.addLocations(locations);
        AsyncStorage.removeItem('backgroundLocations');
      }
    }
  };

  startGeocode = () => {
    this.getGeocodeAsync();
    this.geocodeListener = setInterval(async () => {
      this.getGeocodeAsync();
    }, GEOCODE_INTERVAL);
  };

  stopGeocode = () => {
    this.geocodeListener && clearInterval(this.geocodeListener);
  };

  getGeocodeAsync = async () => {
    const { lastTile, setGeocode } = this.props;
    const geocode = await Location.reverseGeocodeAsync(lastTile);
    geocode[0] && setGeocode(geocode[0]);
  };

  startElevation = () => {
    this.getElevation();
    this.elevationListener = setInterval(async () => {
      this.getElevation();
    }, ELEVATION_INTERVAL);
  };

  stopElevation = () => {
    this.elevationListener && clearInterval(this.elevationListener);
  };

  getElevation = () => {
    const { lastTile, setElevation } = this.props;
    setElevation(lastTile);
  };

  startFriends = () => {
    this.getFriends();
    this.friendListener = setInterval(async () => {
      this.getFriends();
    }, FRIEND_INTERVAL);
  };

  stopFriends = () => {
    this.friendListener && clearInterval(this.friendListener);
  };

  getFriends = () => {
    const { userId, getFriends } = this.props;
    getFriends(userId);
  };

  startPlaces = () => {
    this.getPlaces();
    this.placesListener = setInterval(async () => {
      this.getPlaces();
    }, PLACES_INTERVAL);
  };

  stopPlaces = () => {
    this.placesListener && clearInterval(this.placesListener);
  };

  getPlaces = () => {
    const { lastTile, setPlaces } = this.props;
    setPlaces(lastTile);
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
  notificationPanel: state.app.get('notificationPanel'),
  userId: state.user.get('userId'),
  username: state.user.get('username'),
  quadtree: state.user.get('quadtree'),
  friendQuadtree: state.friend.get('friendQuadtree'),
  tilesToSave: state.user.get('tilesToSave'),
  isSaving: state.user.get('isSaving'),
  map: state.map.get('map'),
  lastTile: state.map.get('lastTile'),
  backgroundTracking: state.map.get('backgroundTracking'),
  followLocation: state.map.get('followLocation'),
  editMode: state.map.get('editMode'),
});

const mapDispatchToProps = {
  setQuadtree: userActions.setQuadtree,
  setTilesToSave: userActions.setTilesToSave,
  saveTiles: userActions.saveTiles,
  saveLastTile: userActions.saveLastTile,
  removeTile: userActions.removeTile,
  getFriends: friendActions.getFriends,
  resetFriend: friendActions.resetFriend,
  setLastTile: mapActions.setLastTile,
  setGeolocation: mapActions.setGeolocation,
  setGeocode: mapActions.setGeocode,
  setPlaces: mapActions.setPlaces,
  setElevation: mapActions.setElevation,
  setFollowLocation: mapActions.setFollowLocation,
  getFlights: flightActions.getFlights,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapScreen);
