import React, { Component } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { Location, Permissions, MapView } from 'expo';

import { actions as userActions } from '../reducers/user';
import Coordinate from '../model/Coordinate';
import InfoText from '../components/InfoText';
import * as LevelUtils from '../utils/LevelUtils';
import * as MathUtils from '../utils/MathUtils';
import * as Earth from '../constants/Earth';
import * as Colors from '../constants/Colors';
import iconMenu from '../assets/iconMenu.png';
import iconLevel from '../assets/iconLevel.png';
import iconLocation from '../assets/iconLocation.png';
import iconSquare from '../assets/iconSquare.png';
import iconSpeed from '../assets/iconSpeed.png';
import iconAltitude from '../assets/iconAltitude.png';
import iconClose from '../assets/iconClose.png';
import mapStyleLight from '../assets/mapStyleLight.json';
import mapStyleDark from '../assets/mapStyleDark.json';

const styles = {
  container: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: 30,
    left: 10,
    borderRadius: 5,
    backgroundColor: Colors.white80,
  },
  menuImage: {
    width: 40,
    height: 40,
    tintColor: Colors.black80,
  },
  geocodeContainer: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  geocodeInfo: {
    marginBottom: 10,
  },
  levelInfo: {
    position: 'absolute',
    top: 30,
    right: 10,
  },
  tileInfo: {
    position: 'absolute',
    top: 70,
    right: 10,
  },
  speedInfo: {
    position: 'absolute',
    top: 110,
    right: 10,
  },
  altitudeInfo: {
    position: 'absolute',
    top: 150,
    right: 10,
  },
  locationButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  locationImage: {
    width: 50,
    height: 50,
    tintColor: Colors.lightBlue80,
  },
  removeImage: {
    width: 50,
    height: 50,
    tintColor: Colors.red80,
  },
};

class MapScreen extends Component {
  constructor(props) {
    super(props);
    const currentLocation = new Coordinate(52.558, 13.206504);

    this.lastTile = {};

    this.state = {
      currentLocation,
      followLocation: true,
      speed: 0,
      altitude: 0,
      geocode: {},
    };
  }

  componentDidMount() {
    this.watchPositionAsync();
  }

  onTileChange() {
    const { currentLocation, followLocation } = this.state;
    this.getGeolocationAsync(currentLocation);
    this.addLocation(this.lastTile);
    followLocation && this.moveToLocation(this.lastTile);
  }

  onRegionChangeComplete(region) {
    const { setRegion } = this.props;
    const { currentLocation } = this.state;
    setRegion(region);

    if (!currentLocation.isInRegion(region)) {
      this.setState({
        followLocation: false,
      });
    }
  }

  getGeolocationAsync = async (location) => {
    await Permissions.askAsync(Permissions.LOCATION);
    const geocode = await Location.reverseGeocodeAsync(location);
    this.setState({
      geocode: {
        country: geocode[0].country,
        region: geocode[0].region,
        city: geocode[0].city,
      },
    });
  };

  watchPositionAsync = async () => {
    await Permissions.askAsync(Permissions.LOCATION);
    this.positionListener = await Location.watchPositionAsync(
      { enableHighAccuracy: true, timeInterval: 0, distanceInterval: 0 },
      (result) => {
        const {
          latitude, longitude, speed, altitude, accuracy,
        } = result.coords;
        const { timestamp } = result;
        const currentLocation = new Coordinate(latitude, longitude);

        if (accuracy < 50) {
          const roundedLocation = new Coordinate(
            currentLocation.getRoundedLatitude(),
            currentLocation.getRoundedLongitude(),
            timestamp,
          );
          if (!Coordinate.isEqual(this.lastTile, roundedLocation)) {
            this.lastTile = roundedLocation;
            this.onTileChange();
          }
        }

        this.setState({
          currentLocation,
          speed: Math.round(MathUtils.toKmh(speed)),
          altitude: Math.round(altitude),
        });
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
    } = this.props;

    if (!MathUtils.containsLocation(location, visitedLocations)) {
      const unsaved = [...tilesToSave, location];
      const visited = [...visitedLocations, location];
      setTilesToSave(unsaved);
      setLocations(visited);

      if (unsaved.length > 0) {
        saveTiles(userId, unsaved);
      }
    }
  }

  moveToLocation(location) {
    this.map.animateToCoordinate(location, 500);
  }

  render() {
    const {
      isLoggedIn,
      mapType,
      visitedLocations,
      holes,
      region,
      navigation,
      friendId,
      resetFriend,
      theme,
    } = this.props;

    const {
      currentLocation, followLocation, speed, altitude, geocode,
    } = this.state;

    if (!isLoggedIn && this.positionListener) {
      this.positionListener.remove();
    }

    const level = LevelUtils.getLevelFromExp(visitedLocations.length);
    const gradient = LevelUtils.getPercentToNextLevel(visitedLocations.length);

    return (
      <View style={styles.container}>
        <MapView
          ref={(ref) => {
            this.map = ref;
          }}
          key={`mapView-${theme}`}
          style={styles.container}
          provider="google"
          initialRegion={region}
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
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Image style={styles.menuImage} source={iconMenu} />
        </TouchableOpacity>
        <View style={styles.geocodeContainer} pointerEvents="none">
          <InfoText style={styles.geocodeInfo} label={geocode.city} />
          <InfoText style={styles.geocodeInfo} label={geocode.region} />
          <InfoText style={styles.geocodeInfo} label={geocode.country} />
        </View>
        <InfoText
          style={styles.levelInfo}
          label={level}
          icon={iconLevel}
          alignRight
          gradient={gradient}
        />
        <InfoText
          style={styles.tileInfo}
          label={visitedLocations.length}
          icon={iconSquare}
          alignRight
        />
        <InfoText style={styles.speedInfo} label={speed} icon={iconSpeed} alignRight />
        <InfoText style={styles.altitudeInfo} label={altitude} icon={iconAltitude} alignRight />
        {friendId ? (
          <View style={styles.locationButton}>
            <TouchableOpacity onPress={() => resetFriend()}>
              <Image style={styles.removeImage} source={iconClose} />
            </TouchableOpacity>
          </View>
        ) : (
          !followLocation && (
            <View style={styles.locationButton}>
              <TouchableOpacity
                onPress={() => {
                  this.moveToLocation(currentLocation);
                  this.setState({ followLocation: true });
                }}
              >
                <Image style={styles.locationImage} source={iconLocation} />
              </TouchableOpacity>
            </View>
          )
        )}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  userId: state.user.get('userId'),
  friendId: state.user.get('friendId'),
  region: state.user.get('region'),
  visitedLocations: state.user.get('visitedLocations'),
  holes: state.user.get('holes'),
  isLoggedIn: state.user.get('isLoggedIn'),
  mapType: state.user.get('mapType'),
  tilesToSave: state.user.get('tilesToSave'),
  theme: state.user.get('theme'),
});

const mapDispatchToProps = {
  setLocations: userActions.setLocations,
  setRegion: userActions.setRegion,
  setTilesToSave: userActions.setTilesToSave,
  saveTiles: userActions.saveTiles,
  resetFriend: userActions.resetFriend,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapScreen);
