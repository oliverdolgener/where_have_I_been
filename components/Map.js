import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Location, Permissions, MapView } from 'expo';
import * as MathUtils from '../utils/MathUtils';
import * as EarthUtils from '../utils/EarthUtils';
import * as Earth from '../constants/Earth';

const styles = {
  container: {
    flex: 1,
  },
  locationCounter: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 5,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  speedCounter: {
    width: 50,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 40,
    right: 20,
    borderRadius: 100,
    borderColor: 'red',
    borderWidth: 5,
    backgroundColor: 'white',
  },
};

class Map extends Component {
  constructor() {
    super();
    this.state = {
      visitedLocations: [],
      speed: 0,
    };
  }

  componentDidMount() {
    fetch('https://api.0llum.de/coordinates')
      .then(response => response.json())
      .then((responseJson) => {
        this.watchPositionAsync();
        this.setState({
          visitedLocations: responseJson,
        });
      });
  }

  watchPositionAsync = async () => {
    await Permissions.askAsync(Permissions.LOCATION);
    await Location.watchPositionAsync(
      { enableHighAccuracy: true, timeInterval: 100, distanceInterval: 1 },
      (result) => {
        const currentLocation = {
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
        };
        this.map.animateToCoordinate(currentLocation, 1000);
        this.setState({
          speed: Math.round(MathUtils.toKmh(result.coords.speed)),
        });
        if (result.coords.accuracy < 32) {
          const roundedLatitude = EarthUtils.getRoundedLatitude(currentLocation.latitude);
          const roundedLocation = {
            latitude: roundedLatitude,
            longitude: EarthUtils.getRoundedLongitude(currentLocation.longitude, roundedLatitude),
          };
          this.addLocation(roundedLocation);
        }
      },
    );
  };

  addLocation(location) {
    const { visitedLocations } = this.state;
    const isInArray = visitedLocations.some(x => x.latitude === location.latitude && x.longitude === location.longitude);
    if (!isInArray) {
      visitedLocations.push(location);
      fetch('https://api.0llum.de/coordinates', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });
    }
    this.setState({
      visitedLocations,
    });
  }

  render() {
    const { visitedLocations, speed } = this.state;
    const holes = [];

    visitedLocations.forEach((x) => {
      holes.push(EarthUtils.getSquareCoordinates(x.latitude, x.longitude));
    });

    return (
      <View style={styles.container}>
        <MapView
          ref={(ref) => {
            this.map = ref;
          }}
          style={styles.container}
          mapPadding={{ top: 20 }}
          provider="google"
          mapType="hybrid"
          rotateEnabled={false}
          pitchEnabled={false}
          showsUserLocation
          followsUserLocation
          maxZoomLevel={18}
        >
          <MapView.Polygon fillColor="rgba(0, 0, 0, 1)" coordinates={Earth.FOG} holes={holes} />
        </MapView>
        <View style={styles.speedCounter}>
          <Text>{speed}</Text>
        </View>
        <Text style={styles.locationCounter}>{visitedLocations.length}</Text>
      </View>
    );
  }
}

export default Map;
