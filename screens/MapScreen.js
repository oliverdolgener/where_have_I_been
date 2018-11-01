import React, { Component } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { Location, DangerZone } from 'expo';
import geolib from 'geolib';

import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
import Coordinate from '../model/Coordinate';
import Speed from '../model/Speed';
import Toolbar from '../components/Toolbar';
import Map from '../components/Map';
import FlightBox from '../components/FlightBox';
import * as MathUtils from '../utils/MathUtils';
import * as Colors from '../constants/Colors';
import iconMenu from '../assets/iconMenu.png';
import iconLocation from '../assets/iconLocation.png';
import iconClose from '../assets/iconRemove.png';

const styles = {
  container: {
    flex: 1,
  },
  batterySaver: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.black,
  },
  menuButton: {
    position: 'absolute',
    top: 30,
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
    bottom: 50,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
  },
};

class MapScreen extends Component {
  constructor() {
    super();
    this.state = {
      showBatterySaver: false,
    };
    this.lastPosition = {
      lat: 0,
      lng: 0,
      time: 0,
    };
    this.speed = new Speed(5);
  }

  componentDidMount() {
    const { userId, getFlights, lastTile } = this.props;
    this.motionListener = DangerZone.DeviceMotion.addListener(result => this.handleMotionEvent(result));
    DangerZone.DeviceMotion.setUpdateInterval(1000);
    this.watchPositionAsync();
    getFlights(userId);
    this.getGeocodeAsync(lastTile);
  }

  componentWillUnmount() {
    this.motionListener.remove();
  }

  onMapPress(coordinate) {
    const { editMode } = this.props;
    if (!editMode) {
      return;
    }

    const location = new Coordinate(coordinate.latitude, coordinate.longitude);
    const timestamp = new Date().getTime();
    const roundedLocation = new Coordinate(
      location.getRoundedLatitude(),
      location.getRoundedLongitude(),
      timestamp,
    );

    this.addLocation(roundedLocation);
  }

  onTileChange(tile) {
    const {
      setLastTile, geolocation, followLocation, map,
    } = this.props;
    setLastTile(tile);
    this.addLocation(tile);
    this.getGeocodeAsync(geolocation.location);
    followLocation && map && map.moveToLocation(tile);
  }

  watchPositionAsync = async () => {
    this.positionListener = await Location.watchPositionAsync(
      { enableHighAccuracy: true, timeInterval: 0, distanceInterval: 0 },
      (result) => {
        const { setGeolocation } = this.props;
        const {
          latitude, longitude, altitude, accuracy,
        } = result.coords;
        const { timestamp } = result;

        const currentPosition = { lat: latitude, lng: longitude, time: timestamp };
        const calculatedSpeed = geolib.getSpeed(this.lastPosition, currentPosition);
        if (calculatedSpeed >= 0 && calculatedSpeed <= 1000) {
          this.speed.addToBuffer(calculatedSpeed);
        }
        this.lastPosition = currentPosition;

        setGeolocation({
          location: new Coordinate(latitude, longitude),
          speed: this.speed.getAverage(),
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

  getGeocodeAsync = async (location) => {
    const { setGeocode } = this.props;
    const geocode = await Location.reverseGeocodeAsync(location);
    geocode[0] && setGeocode(geocode[0]);
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
      const locations = MathUtils.insertIntoGrid(visitedLocations, location);
      const visited = MathUtils.gridToArray(locations);
      setLocations(visited);
      setTilesToSave(unsaved);

      if (!isSaving) {
        saveTiles(userId, unsaved);
      }
    }
  }

  handleMotionEvent(result) {
    const { powerSaver } = this.props;
    if (powerSaver === 'off') {
      return;
    }

    if (result.rotation && result.rotation.beta < -1) {
      this.setState({
        showBatterySaver: true,
      });
    } else if (result.rotation && result.rotation.beta > 1) {
      this.setState({
        showBatterySaver: false,
      });
    }
  }

  render() {
    const {
      isLoggedIn,
      navigation,
      friendId,
      resetFriend,
      followLocation,
      setFollowLocation,
      powerSaver,
      editMode,
    } = this.props;

    const { showBatterySaver } = this.state;

    if (!isLoggedIn && this.positionListener) {
      this.positionListener.remove();
    }

    return (
      <View style={styles.container}>
        <Map onMapPress={coordinate => this.onMapPress(coordinate)} />
        <Toolbar />
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Image style={styles.menuImage} source={iconMenu} />
        </TouchableOpacity>
        {friendId ? (
          <View style={styles.actionButton}>
            <TouchableOpacity onPress={() => resetFriend()}>
              <Image style={styles.actionIcon} source={iconClose} />
            </TouchableOpacity>
          </View>
        ) : (
          !followLocation && (
            <View style={styles.actionButton}>
              <TouchableOpacity
                onPress={() => {
                  const { map } = this.props;
                  map && map.moveToCurrentLocation();
                  setFollowLocation(true);
                }}
              >
                <Image style={styles.actionIcon} source={iconLocation} />
              </TouchableOpacity>
            </View>
          )
        )}
        {editMode && <FlightBox />}
        {powerSaver === 'on' && showBatterySaver && <View style={styles.batterySaver} />}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.user.get('isLoggedIn'),
  userId: state.user.get('userId'),
  friendId: state.user.get('friendId'),
  visitedLocations: state.user.get('visitedLocations'),
  tilesToSave: state.user.get('tilesToSave'),
  isSaving: state.user.get('isSaving'),
  map: state.map.get('map'),
  lastTile: state.map.get('lastTile'),
  powerSaver: state.map.get('powerSaver'),
  geolocation: state.map.get('geolocation'),
  geocode: state.map.get('geocode'),
  followLocation: state.map.get('followLocation'),
  editMode: state.map.get('editMode'),
});

const mapDispatchToProps = {
  setLocations: userActions.setLocations,
  setTilesToSave: userActions.setTilesToSave,
  saveTiles: userActions.saveTiles,
  getFlights: userActions.getFlights,
  resetFriend: userActions.resetFriend,
  setLastTile: mapActions.setLastTile,
  setGeolocation: mapActions.setGeolocation,
  setGeocode: mapActions.setGeocode,
  setFollowLocation: mapActions.setFollowLocation,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapScreen);
