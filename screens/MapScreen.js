import React, { Component } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import { Location, DangerZone } from 'expo';
import ProgressBar from 'react-native-progress/Bar';

import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
import Coordinate from '../model/Coordinate';
import Map from '../components/Map';
import * as LevelUtils from '../utils/LevelUtils';
import * as MathUtils from '../utils/MathUtils';
import * as Colors from '../constants/Colors';
import iconMenu from '../assets/iconMenu.png';
import iconLevel from '../assets/iconLevel.png';
import iconLocation from '../assets/iconLocation.png';
import iconSquare from '../assets/iconSquare.png';
import iconSpeed from '../assets/iconSpeed.png';
import iconAltitude from '../assets/iconAltitude.png';
import iconClose from '../assets/iconRemove.png';

const styles = {
  container: {
    flex: 1,
  },
  toolbar: {
    width: '100%',
    height: 30,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  toolbarItem: {
    flex: 3,
    flexDirection: 'row',
  },
  toolbarIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  toolbarLabel: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    marginRight: 10,
  },
  separator: {
    height: '100%',
    borderWidth: 0.5,
    borderColor: Colors.black,
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
  flightBox: {
    position: 'absolute',
    top: 30,
    right: 10,
    width: 100,
    backgroundColor: Colors.white,
  },
  flightInput: {
    margin: 5,
    paddingHorizontal: 5,
    height: 40,
  },
  flightButton: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: Colors.blue,
  },
  flightButtonLabel: {
    color: Colors.white,
  },
};

class MapScreen extends Component {
  constructor() {
    super();
    this.state = {
      showBatterySaver: false,
      from: '',
      to: '',
    };
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

  onAddFlight() {
    const { addFlight, userId } = this.props;
    const { from, to } = this.state;
    if (!from) {
      return;
    }
    if (!to) {
      return;
    }

    addFlight(userId, from, to);

    this.setState({
      from: '',
      to: '',
    });
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
      visitedLocations,
      navigation,
      friendId,
      resetFriend,
      geolocation,
      followLocation,
      setFollowLocation,
      powerSaver,
      editMode,
    } = this.props;

    const { showBatterySaver, from, to } = this.state;

    const locations = MathUtils.gridToArray(visitedLocations);
    const level = LevelUtils.getLevelFromExp(locations.length);
    const progress = LevelUtils.getPercentToNextLevel(locations.length);

    if (!isLoggedIn && this.positionListener) {
      this.positionListener.remove();
    }

    return (
      <View style={styles.container}>
        <Map onMapPress={coordinate => this.onMapPress(coordinate)} />
        <View style={styles.toolbar}>
          <View style={styles.toolbarItem}>
            <Image style={styles.toolbarIcon} source={iconLevel} />
            <Text style={styles.toolbarLabel}>{level}</Text>
          </View>
          <View style={styles.separator} />
          <View style={[styles.toolbarItem, { flex: 5 }]}>
            <Image style={styles.toolbarIcon} source={iconSquare} />
            <Text style={styles.toolbarLabel}>{locations.length}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.toolbarItem}>
            <Image style={styles.toolbarIcon} source={iconSpeed} />
            <Text style={styles.toolbarLabel}>{geolocation.speed || 0}</Text>
          </View>
          <View style={styles.separator} />
          <View style={[styles.toolbarItem, { flex: 4 }]}>
            <Image style={styles.toolbarIcon} source={iconAltitude} />
            <Text style={styles.toolbarLabel}>{geolocation.altitude || 0}</Text>
          </View>
        </View>
        <ProgressBar
          progress={progress}
          width={null}
          height={5}
          borderRadius={0}
          borderWidth={0}
          unfilledColor={Colors.white}
          color={Colors.blue}
          useNativeDriver
        />
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
        {editMode && (
          <View style={styles.flightBox}>
            <TextInput
              style={styles.flightInput}
              placeholder="From"
              onChangeText={text => this.setState({ from: text })}
              value={from}
              selectionColor={Colors.blue}
              underlineColorAndroid={Colors.blue}
              returnKeyType="next"
              onSubmitEditing={() => this.toInput.focus()}
              autoCorrect={false}
              autoCapitalize="characters"
            />
            <TextInput
              ref={(ref) => {
                this.toInput = ref;
              }}
              style={styles.flightInput}
              placeholder="To"
              onChangeText={text => this.setState({ to: text })}
              value={to}
              selectionColor={Colors.blue}
              underlineColorAndroid={Colors.blue}
              returnKeyType="send"
              onSubmitEditing={() => this.onAddFlight()}
              autoCorrect={false}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.flightButton} onPress={() => this.onAddFlight()}>
              <Text style={styles.flightButtonLabel}>Add Flight</Text>
            </TouchableOpacity>
          </View>
        )}
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
  addFlight: userActions.addFlight,
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
