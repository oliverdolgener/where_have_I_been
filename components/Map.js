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
    const request = new Request('https://api.0llum.de/coordinates');
    return fetch(request)
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          visitedLocations: responseJson,
        });
        this.watchPositionAsync();
      })
      .catch(error => console.log(error));
  }

  watchPositionAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    const location = await Location.watchPositionAsync(
      { enableHighAccuracy: true, timeInterval: 100, distanceInterval: 1 },
      result => {
        const region = {
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        const roundedLatitude = EarthUtils.getRoundedLatitude(region.latitude);
        const roundedLocation = {
          latitude: roundedLatitude,
          longitude: EarthUtils.getRoundedLongitude(region.longitude, roundedLatitude),
        };
        const visitedLocations = this.state.visitedLocations;
        const isInArray = visitedLocations.some(
          x => x.latitude === roundedLocation.latitude && x.longitude === roundedLocation.longitude,
        );
        if (!isInArray) {
          visitedLocations.push(roundedLocation);
          const request = new Request('https://api.0llum.de/coordinates', {
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
          fetch(request);
        }
        this.setState({
          location: region,
          roundedLocation,
          visitedLocations,
        });
      },
    );
  };

  render() {
    const { location, roundedLocation, visitedLocations } = this.state;
    const fog = [
      {
        latitude: 89.999999,
        longitude: -179.999999,
      },
      {
        latitude: -89.999999,
        longitude: -179.999999,
      },
      {
        latitude: -89.999999,
        longitude: 0,
      },
      {
        latitude: -89.999999,
        longitude: 179.999999,
      },
      {
        latitude: 89.999999,
        longitude: 179.999999,
      },
      {
        latitude: 89.999999,
        longitude: 0,
      },
    ];
    const holes = [];
    // holes.push([
    //   {
    //     latitude: 53,
    //     longitude: 13,
    //   },
    //   {
    //     latitude: 52,
    //     longitude: 13,
    //   },
    //   {
    //     latitude: 52,
    //     longitude: 14,
    //   },
    //   {
    //     latitude: 53,
    //     longitude: 14,
    //   },
    // ]);
    // holes.push([
    //   {
    //     latitude: 53,
    //     longitude: 12,
    //   },
    //   {
    //     latitude: 52,
    //     longitude: 12,
    //   },
    //   {
    //     latitude: 52,
    //     longitude: 12.999999,
    //   },
    //   {
    //     latitude: 53,
    //     longitude: 12.999999,
    //   },
    // ]);
    if (visitedLocations.length > 0) {
      for (let i = 0; i < visitedLocations.length; i++) {
        holes.push([
          {
            latitude: visitedLocations[i].latitude - Earth.GRID_DISTANCE / 2.01,
            longitude:
              visitedLocations[i].longitude +
              EarthUtils.gridDistanceAtLatitude(visitedLocations[i].latitude) / 2.01,
          },
          {
            latitude: visitedLocations[i].latitude - Earth.GRID_DISTANCE / 2.01,
            longitude:
              visitedLocations[i].longitude -
              EarthUtils.gridDistanceAtLatitude(visitedLocations[i].latitude) / 2.01,
          },
          {
            latitude: visitedLocations[i].latitude + Earth.GRID_DISTANCE / 2.01,
            longitude:
              visitedLocations[i].longitude -
              EarthUtils.gridDistanceAtLatitude(visitedLocations[i].latitude) / 2.01,
          },
          {
            latitude: visitedLocations[i].latitude + Earth.GRID_DISTANCE / 2.01,
            longitude:
              visitedLocations[i].longitude +
              EarthUtils.gridDistanceAtLatitude(visitedLocations[i].latitude) / 2.01,
          },
        ]);
      }
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
          {/* {visitedLocations.map(x => (
            <MapView.Circle
              key={visitedLocations.indexOf(x).toString()}
              center={x}
              radius={50}
              strokeColor="rgba(0, 0, 0, 0)"
              fillColor="rgba(255, 255, 255, 0.25)"
            />
          ))} */}
          <MapView.Polygon fillColor="rgba(0, 0, 0, 1)" coordinates={fog} holes={holes} />
        </MapView>
        {location && (
          <Text>
            {location.latitude}, {location.longitude} => {roundedLocation.latitude},{' '}
            {roundedLocation.longitude} => {visitedLocations.length}
          </Text>
        )}
      </View>
    );
  }
}

export default Map;
