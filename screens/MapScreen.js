import React, { Component } from 'react';
import { Platform, View, Text, Image, TouchableOpacity } from 'react-native';
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
    bottom: 10,
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

    this.state = {
      currentLocation: new Coordinate(),
      followLocation: true,
      speed: 0,
      altitude: 0,
      geocode: {},
    };

    this.getGeolocationAsync(props.lastTile);
    this.markers = [];
    this.fontSize = 20;
  }

  componentDidMount() {
    this.watchPositionAsync();
  }

  onTileChange(tile) {
    const { setLastTile } = this.props;
    const { currentLocation } = this.state;
    setLastTile(tile);
    this.addLocation(tile);
    this.getGeolocationAsync(currentLocation);
  }

  onRegionChangeComplete(region) {
    region.longitudeDelta = region.longitudeDelta < 0 ? region.longitudeDelta + 360 : region.longitudeDelta;
    const { setRegion } = this.props;
    const { currentLocation } = this.state;
    setRegion(region);

    if (Platform.OS === 'ios' && !currentLocation.isInRegion(region)) {
      this.setState({
        followLocation: false,
      });
    }

    const visibleGrid = MathUtils.filterVisibleLocations(this.props.visitedLocations, region);
    const visibleArray = MathUtils.gridToArray(visibleGrid);

    this.markers = visibleArray.map(x => ({
      ...x,
      neighbours: Coordinate.getNeighbours(x, visibleGrid),
    }));
    this.fontSize = 0.2 / region.longitudeDelta;
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
        const currentLocation = new Coordinate(latitude, longitude, timestamp);

        if (accuracy < 50) {
          const { lastTile } = this.props;
          const roundedLocation = new Coordinate(
            currentLocation.getRoundedLatitude(),
            currentLocation.getRoundedLongitude(),
            timestamp,
          );
          if (!Coordinate.isEqual(lastTile, roundedLocation)) {
            this.onTileChange(roundedLocation);
          }
          this.state.followLocation && this.moveToLocation(currentLocation);
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
      isSaving,
    } = this.props;

    const locations = MathUtils.gridToArray(visitedLocations);

    if (!MathUtils.containsLocation(location, locations)) {
      const unsaved = [...tilesToSave, location];
      const visited = [...locations, location];
      setTilesToSave(unsaved);
      setLocations(visited);

      if (!isSaving) {
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
      navigation,
      friendId,
      resetFriend,
      theme,
      lastTile,
    } = this.props;

    const {
      currentLocation, followLocation, speed, altitude, geocode,
    } = this.state;

    if (!isLoggedIn && this.positionListener) {
      this.positionListener.remove();
    }

    const locations = MathUtils.gridToArray(visitedLocations);

    // const neighbours = MathUtils.gridToArray(props.visitedLocations).map(x => Coordinate.getNeighbours(x, props.visitedLocations).length + 1);
    // const score = neighbours.reduce((y, z) => y + z, 0);
    const level = LevelUtils.getLevelFromExp(locations.length);
    const gradient = LevelUtils.getPercentToNextLevel(locations.length);

    return (
      <View style={styles.container}>
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
          onPanDrag={() => this.setState({ followLocation: false })}
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
          {this.markers.map(x => (
            <MapView.Marker coordinate={x} key={x.longitude} anchor={{ x: 0.5, y: 0.5 }}>
              <Text style={{ fontSize: this.fontSize }}>
                {x.neighbours.length + 1}
              </Text>
            </MapView.Marker>
          ))}
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
          label={locations.length}
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
  lastTile: state.user.get('lastTile'),
  isSaving: state.user.get('isSaving'),
});

const mapDispatchToProps = {
  setLocations: userActions.setLocations,
  setRegion: userActions.setRegion,
  setTilesToSave: userActions.setTilesToSave,
  saveTiles: userActions.saveTiles,
  resetFriend: userActions.resetFriend,
  setLastTile: userActions.setLastTile,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapScreen);
