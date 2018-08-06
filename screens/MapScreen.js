import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { Location, Permissions, MapView } from 'expo';
import { actions as mapActions } from '../reducers/map';
import Coordinate from '../model/Coordinate';
import InfoText from '../components/InfoText';
import * as LevelUtils from '../utils/LevelUtils';
import * as MathUtils from '../utils/MathUtils';
import * as EarthUtils from '../utils/EarthUtils';
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
  countryInfo: {
    fontSize: 20,
    color: Colors.white,
  },
  regionInfo: {
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
    const { user } = props.navigation.state.params;
    let visitedLocations = user.locations.map(x => new Coordinate(x.latitude, x.longitude));
    visitedLocations = MathUtils.removeDuplicateLocations(visitedLocations);
    // this.coherentTiles = Coordinate.getCoherentTiles(visitedLocations);
    // const holes = visitedLocations.map(x => x.getCorners());
    const holes = EarthUtils.getSliceCoordinates(visitedLocations);

    // let vertices = [];
    // visitedLocations.forEach(x => vertices.push(...EarthUtils.getSquareCoordinates(x)));
    // vertices = MathUtils.removeBothDuplicateLocations(vertices);
    // vertices.sort((a, b) => {
    //   const latC = 52.5568;
    //   const longC = 13.207;
    //   const lat1 = a.latitude;
    //   const long1 = a.longitude;
    //   const lat2 = b.latitude;
    //   const long2 = b.longitude;
    //   const angle1 = Math.atan2(lat1 - latC, long1 - longC);
    //   const angle2 = Math.atan2(lat2 - latC, long2 - longC);

    //   if (angle1 < angle2) {
    //     return -1;
    //   }

    //   return 1;
    // });
    // const holes = [vertices];

    this.lastTile = {};

    this.state = {
      currentLocation: new Coordinate(52.558, 13.206504),
      visitedLocations,
      holes,
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
    const { currentLocation } = this.state;
    this.getGeolocationAsync(currentLocation);
    this.addLocation(this.lastTile);
  }

  getGeolocationAsync = async (location) => {
    await Permissions.askAsync(Permissions.LOCATION);
    const geocode = await Location.reverseGeocodeAsync(location);
    this.setState({
      geocode: {
        country: geocode[0].country,
        region: geocode[0].region,
      },
    });
  };

  watchPositionAsync = async () => {
    await Permissions.askAsync(Permissions.LOCATION);
    this.positionListener = await Location.watchPositionAsync(
      { enableHighAccuracy: true, timeInterval: 0, distanceInterval: 0 },
      (result) => {
        const {
          latitude, longitude, speed, altitude,
        } = result.coords;
        const { followLocation } = this.state;
        const currentLocation = new Coordinate(latitude, longitude);

        if (result.coords.accuracy < 50) {
          const roundedLocation = new Coordinate(
            currentLocation.getRoundedLatitude(),
            currentLocation.getRoundedLongitude(),
          );
          if (!Coordinate.isEqual(this.lastTile, roundedLocation)) {
            this.lastTile = roundedLocation;
            this.onTileChange();
          }
        }

        followLocation && this.moveToLocation(currentLocation);
        this.setState({
          currentLocation,
          speed: Math.round(MathUtils.toKmh(speed)),
          altitude: Math.round(altitude),
        });
      },
    );
  };

  addLocation(location) {
    const { visitedLocations } = this.state;
    if (!MathUtils.containsLocation(location, visitedLocations)) {
      const tilesToSaveCopy = this.props.tilesToSave;
      tilesToSaveCopy.push(location);
      this.props.setTilesToSave(tilesToSaveCopy);
      visitedLocations.push(location);
      // const holes = visitedLocations.map(x => x.getCorners());
      const holes = EarthUtils.getSliceCoordinates(visitedLocations);
      this.setState({
        visitedLocations,
        holes,
      });
    }
    this.saveLocations();
  }

  saveLocations() {
    const { user } = this.props.navigation.state.params;
    if (this.props.tilesToSave.length > 0) {
      fetch(`https://api.0llum.de/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locations: this.props.tilesToSave,
        }),
      }).then((response) => {
        if (response.status === 200) {
          this.props.setTilesToSave([]);
        }
      });
    }
  }

  moveToLocation(location) {
    this.map.animateToCoordinate(location, 500);
    // this.map.animateToNavigation(currentLocation, result.coords.heading, 0, 500);
  }

  render() {
    const { isLoggedIn, mapType } = this.props;
    const {
      currentLocation,
      visitedLocations,
      holes,
      followLocation,
      speed,
      altitude,
      geocode,
    } = this.state;

    // const vertices = [];
    // visitedLocations.forEach(x => vertices.push(...EarthUtils.getSquareCoordinates(x)));

    // const edges = [];
    // visitedLocations.forEach(x => edges.push(...EarthUtils.getSquareEdges(x)));

    // const intersects = [];

    // edges.forEach((edge) => {
    //   intersects.push(vertices.filter(vertex => EarthUtils.isPointOnEdge(vertex, edge)));
    // });

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
          initialRegion={{
            latitude: 52.558,
            longitude: 13.206504,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          onPanDrag={() => {
            this.setState({
              followLocation: false,
            });
          }}
        >
          {mapType === 'watercolor' && (
            <MapView.UrlTile
              urlTemplate="http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg"
              zIndex={-1}
            />
          )}
          <MapView.Polygon
            fillColor={Colors.black}
            strokeColor={Colors.transparent}
            coordinates={Earth.FOG}
            holes={holes}
          />
          {/* {holes.map(x => <MapView.Polygon fillColor={Colors.black} coordinates={x} />)} */}
          {/* {this.coherentTiles.map(x => x.map(y => <MapView.Marker coordinate={y} key={JSON.stringify(y)} />))} */}
        </MapView>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => this.props.navigation.openDrawer()}
        >
          <Image style={styles.menuImage} source={iconMenu} />
        </TouchableOpacity>
        <View style={styles.geocodeContainer}>
          <Text style={styles.countryInfo}>{geocode.country}</Text>
          <Text style={styles.regionInfo}>{geocode.region}</Text>
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
                this.setState({
                  followLocation: true,
                });
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
  isLoggedIn: state.user.get('isLoggedIn'),
  mapType: state.map.get('mapType'),
  tilesToSave: state.map.get('tilesToSave'),
});

const mapDispatchToProps = {
  setTilesToSave: mapActions.setTilesToSave,
};

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);
