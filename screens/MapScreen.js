import React, { Component } from 'react';
import { Dimensions, View, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { Location, Permissions, MapView } from 'expo';
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
  locationButton: {
    position: 'absolute',
    bottom: 30,
  },
  locationImage: {
    width: 50,
    height: 50,
    tintColor: Colors.lightBlue80,
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
  countryInfo: {
    width: 140,
    position: 'absolute',
    top: 40,
    left: 20,
  },
  regionInfo: {
    width: 140,
    position: 'absolute',
    top: 80,
    left: 20,
  },
  streetInfo: {
    width: 140,
    position: 'absolute',
    top: 120,
    left: 20,
  },
};

class MapScreen extends Component {
  constructor(props) {
    super(props);
    const { user } = props.navigation.state.params;
    const visitedLocations = user.locations || [];
    // const holes = visitedLocations.map(x => [...EarthUtils.getSquareCoordinates(x)]);
    const holes = EarthUtils.convertSquaresToSlices(visitedLocations);
    this.locationsToSave = [];
    const positionListener = null;

    this.state = {
      dimensions: Dimensions.get('window'),
      currentLocation: {
        latitude: 52.5575,
        longitude: 13.206354,
      },
      visitedLocations,
      holes,
      followLocation: true,
      speed: 0,
      altitude: 0,
      country: '',
      region: '',
      street: '',
    };
  }

  componentWillMount() {
    Dimensions.addEventListener('change', (dimensions) => {
      this.setState({
        dimensions: dimensions.window,
      });
    });
  }

  componentDidMount() {
    this.watchPositionAsync();
  }

  getGeolocationAsync = async (location) => {
    await Permissions.askAsync(Permissions.LOCATION);
    const geocode = await Location.reverseGeocodeAsync(location);
    this.setState({
      country: geocode[0].country,
      region: geocode[0].region,
      street: geocode[0].street,
    });
  };

  watchPositionAsync = async () => {
    await Permissions.askAsync(Permissions.LOCATION);
    this.positionListener = await Location.watchPositionAsync(
      { enableHighAccuracy: true, timeInterval: 0, distanceInterval: 0 },
      (result) => {
        const { followLocation } = this.state;
        const currentLocation = {
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
        };
        this.setState({
          currentLocation,
          speed: Math.round(MathUtils.toKmh(result.coords.speed)),
          altitude: Math.round(result.coords.altitude),
        });
        followLocation && this.moveToLocation(currentLocation);

        if (result.coords.accuracy < 50) {
          const roundedLatitude = EarthUtils.getRoundedLatitude(currentLocation.latitude);
          const roundedLocation = {
            latitude: roundedLatitude,
            longitude: EarthUtils.getRoundedLongitude(currentLocation.longitude, roundedLatitude),
          };
          this.addLocation(roundedLocation);
        }

        // this.getGeolocationAsync(currentLocation);
      },
    );
  };

  addLocation(location) {
    const { visitedLocations } = this.state;
    if (!MathUtils.containsLocation(location, visitedLocations)) {
      this.locationsToSave.push(location);
      visitedLocations.push(location);
      // const holes = visitedLocations.map(x => [...EarthUtils.getSquareCoordinates(x)]);
      const holes = EarthUtils.convertSquaresToSlices(visitedLocations);
      this.setState({
        visitedLocations,
        holes,
      });
      this.saveLocations();
    }
  }

  saveLocations() {
    const { user } = this.props.navigation.state.params;
    if (this.locationsToSave.length > 0) {
      fetch(`https://api.0llum.de/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locations: this.locationsToSave,
        }),
      }).then((response) => {
        if (response.status === 200) {
          this.locationsToSave = [];
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
      dimensions,
      currentLocation,
      visitedLocations,
      holes,
      followLocation,
      speed,
      altitude,
      country,
      region,
      street,
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
          mapPadding={{ top: 20 }}
          provider="google"
          mapType={mapType === 'watercolor' ? 'none' : mapType}
          customMapStyle={mapStyle}
          rotateEnabled={false}
          pitchEnabled={false}
          showsIndoors={false}
          zoomControlEnabled={false}
          showsMyLocationButton={false}
          showsUserLocation
          followsUserLocation
          maxZoomLevel={18}
          initialRegion={{
            latitude: 52.5575,
            longitude: 13.206354,
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
        </MapView>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => this.props.navigation.openDrawer()}
        >
          <Image style={styles.menuImage} source={iconMenu} />
        </TouchableOpacity>
        {/* <InfoText style={styles.countryInfo} label={country} width={100} gradient={0} />
        <InfoText style={styles.regionInfo} label={region} width={100} gradient={0} />
        <InfoText style={styles.streetInfo} label={street} width={100} gradient={0} /> */}
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
          <TouchableOpacity
            style={[styles.locationButton, { left: dimensions.width / 2 - 25 }]}
            onPress={() => {
              this.moveToLocation(currentLocation);
              this.setState({
                followLocation: true,
              });
            }}
          >
            <Image style={styles.locationImage} source={iconLocation} />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.user.get('isLoggedIn'),
  mapType: state.map.get('mapType'),
});

export default connect(mapStateToProps)(MapScreen);
