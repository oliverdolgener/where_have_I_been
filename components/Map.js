import React, { Component } from 'react';
import { View } from 'react-native';
import { Location, Permissions, MapView } from 'expo';
import InfoText from '../components/InfoText';
import * as SortUtils from '../utils/SortUtils';
import * as MathUtils from '../utils/MathUtils';
import * as EarthUtils from '../utils/EarthUtils';
import * as Earth from '../constants/Earth';

const styles = {
  container: {
    flex: 1,
  },
  tileInfo: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  speedInfo: {
    position: 'absolute',
    top: 80,
    right: 20,
  },
};

class Map extends Component {
  constructor() {
    super();
    this.locationsToSave = [];
    this.state = {
      visitedLocations: [],
      speed: 0,
      followLocation: true,
      rotateDirection: true,
    };
  }

  componentDidMount() {
    fetch('https://api.0llum.de/coordinates')
      .then(response => response.json())
      .then((responseJson) => {
        this.watchPositionAsync();
        const visitedLocations = responseJson;
        visitedLocations.sort(SortUtils.byLatitudeDesc);
        this.setState({
          visitedLocations,
        });
      });
  }

  watchPositionAsync = async () => {
    const { followLocation, rotateDirection } = this.state;
    await Permissions.askAsync(Permissions.LOCATION);
    await Location.watchPositionAsync(
      { enableHighAccuracy: true, timeInterval: 100, distanceInterval: 1 },
      (result) => {
        const currentLocation = {
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
        };
        followLocation && this.map.animateToCoordinate(currentLocation, 500);
        rotateDirection && this.map.animateToBearing(result.coords.heading, 500);
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
      this.locationsToSave.push(location);
      visitedLocations.push(location);
      visitedLocations.sort(SortUtils.byLatitudeDesc);
      fetch('https://api.0llum.de/coordinates', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.locationsToSave),
      }).then((response) => {
        if (response.status === 201) {
          this.locationsToSave = [];
        }
      });
    }
    this.setState({
      visitedLocations,
    });
  }

  render() {
    const { visitedLocations, speed } = this.state;
    const holes = EarthUtils.convertSquaresToSlices(visitedLocations);

    return (
      <View style={styles.container}>
        <MapView
          ref={(ref) => {
            this.map = ref;
          }}
          style={styles.container}
          mapPadding={{ top: 20 }}
          provider="google"
          mapType="satellite"
          rotateEnabled
          pitchEnabled={false}
          showsIndoors={false}
          zoomControlEnabled={false}
          loadingBackgroundColor="#000000"
          showsUserLocation
          followsUserLocation
          maxZoomLevel={18}
          initialRegion={{
            latitude: 52.5575,
            longitude: 13.206354,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <MapView.Polygon fillColor="rgba(0, 0, 0, 1)" coordinates={Earth.FOG} holes={holes} />
        </MapView>
        <InfoText style={styles.speedInfo} label={speed} />
        <InfoText style={styles.tileInfo} label={visitedLocations.length} />
      </View>
    );
  }
}

export default Map;
