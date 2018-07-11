import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Constants, Location, Permissions, MapView } from 'expo';
import * as MathUtils from '../utils/MathUtils';

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

  componentWillMount() {
    this.watchPositionAsync();
  }

  watchPositionAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    const location = await Location.watchPositionAsync(
      { enableHighAccuracy: true, timeInterval: 100, distanceInterval: 1 },
      result => {
        const region = {
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        };
        const roundedLocation = {
          latitude: MathUtils.round(region.latitude, 4, 5),
          longitude: MathUtils.round(region.longitude, 4, 5),
        };
        const visitedLocations = this.state.visitedLocations;
        const isInArray = visitedLocations.some(x => JSON.stringify(x) === JSON.stringify(roundedLocation));
        if (!isInArray) {
          visitedLocations.push(roundedLocation);
        }
        this.setState({
          location: region,
          roundedLocation,
          visitedLocations,
        });
      }
    );
  };

  render() {
    const { location, roundedLocation, visitedLocations } = this.state;
    return (
      <View style={styles.container}>
        <MapView
          ref={(ref) => { this.map = ref}}
          style={styles.container}
          rotateEnabled={false}
          pitchEnabled={false}
          showsUserLocation={true}
          followsUserLocation={true}
          // region={location}
        >
          {visitedLocations.map(x => (
            <MapView.Marker key={visitedLocations.indexOf(x).toString()} coordinate={x}/>
          ))}
          {visitedLocations.map(x => (
            <MapView.Circle key={visitedLocations.indexOf(x).toString()} center={x} radius={50}/>
          ))}
        </MapView>
        {location && <Text>{location.latitude}, {location.longitude} => {roundedLocation.latitude}, {roundedLocation.longitude} => {visitedLocations.length}</Text>}
      </View>
    );
  }
}

export default Map;
