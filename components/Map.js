import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Constants, Location, Permissions, MapView } from 'expo';
import * as MathUtils from '../utils/MathUtils';
import * as EarthUtils from '../utils/EarthUtils';
import * as Earth from '../constants/Earth';
import { RangeObservable } from '../node_modules/rxjs/observable/RangeObservable';

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
      roundedLocation: null,
      visitedLocations: [],
    };
  }

  componentDidMount() {
    fetch('https://api.0llum.de/coordinates')
      .then(response => response.json())
      .then(responseJson => {
        this.watchPositionAsync();
        this.setState({
          visitedLocations: responseJson,
        });
      });
  }

  watchPositionAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    const location = await Location.watchPositionAsync(
      { enableHighAccuracy: true, timeInterval: 100, distanceInterval: 1 },
      result => {
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
          const visitedLocations = this.state.visitedLocations;
          const isInArray = visitedLocations.some(
            x =>
              x.latitude === roundedLocation.latitude && x.longitude === roundedLocation.longitude,
          );
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
            roundedLocation,
            visitedLocations,
          });
        }
      },
    );
  };

  render() {
    const { location, roundedLocation, visitedLocations } = this.state;
    const holes = [];

    for (let i = 0; i < visitedLocations.length; i++) {
      holes.push(
        EarthUtils.getSquareCoordinates(
          visitedLocations[i].latitude,
          visitedLocations[i].longitude,
        ),
      );
    }

    return (
      <View style={styles.container}>
        <MapView
          ref={ref => {
            this.map = ref;
          }}
          style={styles.container}
          mapType="satellite"
          rotateEnabled={false}
          pitchEnabled={false}
          showsUserLocation={true}
          followsUserLocation={true}
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
