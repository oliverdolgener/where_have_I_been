import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
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
import mapStyle from '../assets/mapStyle.json';

const styles = {
  container: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: 30,
    left: 10,
  },
  menuImage: {
    width: 50,
    height: 50,
    tintColor: Colors.white80,
  },
  geocodeContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  cityInfo: {
    fontSize: 20,
    color: Colors.white,
  },
  regionInfo: {
    fontSize: 18,
    color: Colors.white,
  },
  countryInfo: {
    fontSize: 16,
    color: Colors.white,
  },
  levelInfo: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  tileInfo: {
    position: 'absolute',
    top: 80,
    right: 20,
  },
  speedInfo: {
    position: 'absolute',
    top: 120,
    right: 20,
  },
  altitudeInfo: {
    position: 'absolute',
    top: 160,
    right: 20,
  },
  locationButton: {
    position: 'absolute',
    top: 0,
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
    setRegion(region);
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
      const tilesToSaveCopy = tilesToSave;
      tilesToSaveCopy.push(location);
      setTilesToSave(tilesToSaveCopy);
      visitedLocations.push(location);
      setLocations(visitedLocations);
    }

    if (tilesToSave.length > 0) {
      saveTiles(userId, tilesToSave);
    }
  }

  moveToLocation(location) {
    this.map.animateToCoordinate(location, 500);
  }

  render() {
    const {
      isLoggedIn, mapType, visitedLocations, holes, region,
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
          style={styles.container}
          provider="google"
          mapType={mapType === 'watercolor' ? 'none' : mapType}
          customMapStyle={mapStyle}
          rotateEnabled={false}
          pitchEnabled={false}
          showsScale={false}
          showsCompass={false}
          showsPointsOfInterest={false}
          showsIndoors={false}
          zoomControlEnabled={false}
          showsMyLocationButton={false}
          showsUserLocation
          maxZoomLevel={18}
          initialRegion={region}
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
            holes={holes || []}
          />
        </MapView>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => this.props.navigation.openDrawer()}
        >
          <Image style={styles.menuImage} source={iconMenu} />
        </TouchableOpacity>
        <View style={styles.geocodeContainer}>
          <Text style={styles.cityInfo}>{geocode.city}</Text>
          <Text style={styles.regionInfo}>{geocode.region}</Text>
          <Text style={styles.countryInfo}>{geocode.country}</Text>
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
          gradient={0}
        />
        <InfoText style={styles.speedInfo} label={speed} icon={iconSpeed} alignRight gradient={0} />
        <InfoText
          style={styles.altitudeInfo}
          label={altitude}
          icon={iconAltitude}
          alignRight
          gradient={0}
        />
        {!followLocation && (
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
        )}
      </View>
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
});

const mapDispatchToProps = {
  setLocations: userActions.setLocations,
  setRegion: userActions.setRegion,
  setTilesToSave: userActions.setTilesToSave,
  saveTiles: userActions.saveTiles,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapScreen);
