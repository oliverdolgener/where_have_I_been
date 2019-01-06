import React, { Component } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { connect } from 'react-redux';
import { Location, DangerZone } from 'expo';
import geolib from 'geolib';
import { Box } from 'js-quadtree';

import { actions as userActions } from '../reducers/user';
import { actions as friendActions } from '../reducers/friend';
import { actions as mapActions } from '../reducers/map';
import LatLng from '../model/LatLng';
import GeoLocation from '../model/GeoLocation';
import GeoArray from '../model/GeoArray';
import Speed from '../model/Speed';
import TouchableScale from '../components/TouchableScale';
import Toolbar from '../components/Toolbar';
import Map from '../components/Map';
import FlightBox from '../components/FlightBox';
import * as Colors from '../constants/Colors';
import iconMenu from '../assets/iconMenu.png';
import iconLocation from '../assets/iconLocation.png';
import iconClose from '../assets/iconRemove.png';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  batterySaver: {
    flex: 1,
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
});

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
      this.addLocation(roundedLocation);
    } else {
      this.removeLocation(roundedLocation);
    }
  }

  onTileChange(tile) {
    const {
      setLastTile, geolocation, followLocation, map,
    } = this.props;
    setLastTile(tile);
    this.addLocation(tile);
    this.getGeocodeAsync(geolocation);
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
          const { lastTile } = this.props;
          const roundedLocation = GeoLocation.getRoundedLocation(location);
          if (!GeoLocation.isEqual(lastTile, roundedLocation)) {
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
      quadtree,
      tilesToSave,
      setTilesToSave,
      saveTiles,
      setQuadtree,
      isSaving,
    } = this.props;

    const point = LatLng.toPoint(location);
    const box = new Box(point.x, point.y, 0, 0);
    const found = quadtree.query(box);

    if (found.length < 1) {
      const unsaved = [...tilesToSave, location];
      quadtree.insert(point);
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
      friendQuadtree,
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

    return powerSaver === 'on' && showBatterySaver ? (
      <View style={styles.batterySaver} />
    ) : (
      <View style={styles.container}>
        <Map onMapPress={coordinate => this.onMapPress(coordinate)} />
        <Toolbar />
        <TouchableScale
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
          scaleTo={1.1}
        >
          <Image style={styles.menuImage} source={iconMenu} />
        </TouchableScale>
        {friendQuadtree ? (
          <View style={styles.actionButton}>
            <TouchableScale onPress={() => resetFriend()} scaleTo={1.1}>
              <Image style={styles.actionIcon} source={iconClose} />
            </TouchableScale>
          </View>
        ) : (
          !followLocation && (
            <View style={styles.actionButton}>
              <TouchableScale
                onPress={() => {
                  const { map } = this.props;
                  map && map.moveToCurrentLocation();
                  setFollowLocation(true);
                }}
                scaleTo={1.1}
              >
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
  isLoggedIn: state.user.get('isLoggedIn'),
  userId: state.user.get('userId'),
  quadtree: state.user.get('quadtree'),
  friendQuadtree: state.friend.get('friendQuadtree'),
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
  setQuadtree: userActions.setQuadtree,
  setLocations: userActions.setLocations,
  setTilesToSave: userActions.setTilesToSave,
  saveTiles: userActions.saveTiles,
  removeTile: userActions.removeTile,
  getFlights: userActions.getFlights,
  resetFriend: friendActions.resetFriend,
  setLastTile: mapActions.setLastTile,
  setGeolocation: mapActions.setGeolocation,
  setGeocode: mapActions.setGeocode,
  setFollowLocation: mapActions.setFollowLocation,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapScreen);
