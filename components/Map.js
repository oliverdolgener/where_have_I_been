import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Location, Permissions, MapView } from 'expo';
import * as EarthUtils from '../utils/EarthUtils';
import * as Earth from '../constants/Earth';

const styles = {
  container: {
    flex: 1,
  },
};

class Map extends Component {
  constructor() {
    super();
    this.state = {
      location: null,
      visitedLocations: [],
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
        if (result.coords.accuracy < 25) {
          const location = {
            latitude: result.coords.latitude,
            longitude: result.coords.longitude,
            accuracy: result.coords.accuracy,
          };
          const roundedLatitude = EarthUtils.getRoundedLatitude(location.latitude);
          const roundedLocation = {
            latitude: roundedLatitude,
            longitude: EarthUtils.getRoundedLongitude(location.longitude, roundedLatitude),
          };
          const { visitedLocations } = this.state;
          const isInArray = visitedLocations.some(x =>
            x.latitude === roundedLocation.latitude && x.longitude === roundedLocation.longitude);
          if (!isInArray) {
            visitedLocations.push(roundedLocation);
            fetch('https://api.0llum.de/coordinates', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                latitude: roundedLocation.latitude,
                longitude: roundedLocation.longitude,
              }),
            });
          }
          this.setState({
            location,
            visitedLocations,
          });
        }
      },
    );
  };

  render() {
    const { location, visitedLocations } = this.state;
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
        {location && (
          <Text>
            {visitedLocations.length}, {location.accuracy}
          </Text>
        )}
      </View>
    );
  }
}

export default Map;
