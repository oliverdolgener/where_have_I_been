import React, { Component } from 'react';
import { Dimensions, View, Image, TouchableOpacity } from 'react-native';
import { Location, Permissions, MapView } from 'expo';
import InfoText from '../components/InfoText';
import * as SortUtils from '../utils/SortUtils';
import * as MathUtils from '../utils/MathUtils';
import * as EarthUtils from '../utils/EarthUtils';
import * as Earth from '../constants/Earth';
import iconLocation from '../assets/iconLocation.png';
import iconSquare from '../assets/iconSquare.png';
import iconSpeed from '../assets/iconSpeed.png';
import iconAltitude from '../assets/iconAltitude.png';

const styles = {
  container: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    bottom: 30,
  },
  locationImage: {
    width: 50,
    height: 50,
    tintColor: 'rgba(100, 200, 250, 0.8)',
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
  altitudeInfo: {
    position: 'absolute',
    top: 120,
    right: 20,
  },
  countryInfo: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  regionInfo: {
    position: 'absolute',
    top: 80,
    left: 20,
  },
  streetInfo: {
    position: 'absolute',
    top: 120,
    left: 20,
  },
};

class Map extends Component {
  constructor() {
    super();
    this.locationsToSave = [];
    this.state = {
      dimensions: Dimensions.get('window'),
      currentLocation: {
        latitude: 52.5575,
        longitude: 13.206354,
      },
      visitedLocations: [],
      holes: [],
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
    fetch('https://api.0llum.de/coordinates')
      .then(response => response.json())
      .then((responseJson) => {
        const visitedLocations = responseJson;
        visitedLocations.sort(SortUtils.byLatitudeDesc);
        const holes = visitedLocations.map(x => [...EarthUtils.getSquareCoordinates(x)]);
        // const holes = EarthUtils.convertSquaresToSlices(visitedLocations);
        this.setState({
          visitedLocations,
          holes,
        });
      });
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
    await Location.watchPositionAsync(
      { enableHighAccuracy: true, timeInterval: 100, distanceInterval: 1 },
      (result) => {
        const currentLocation = {
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
        };
        this.setState({
          currentLocation,
          speed: Math.round(MathUtils.toKmh(result.coords.speed)),
          altitude: Math.round(result.coords.altitude),
        });
        this.moveToLocation();

        if (result.coords.accuracy < 32) {
          const roundedLatitude = EarthUtils.getRoundedLatitude(currentLocation.latitude);
          const roundedLocation = {
            latitude: roundedLatitude,
            longitude: EarthUtils.getRoundedLongitude(currentLocation.longitude, roundedLatitude),
          };
          this.addLocation(roundedLocation);
        }

        this.getGeolocationAsync(currentLocation);
      },
    );
  };

  addLocation(location) {
    const { visitedLocations } = this.state;
    const isInArray = visitedLocations.some(x => x.latitude === location.latitude && x.longitude === location.longitude);
    if (!isInArray) {
      const holes = visitedLocations.map(x => [...EarthUtils.getSquareCoordinates(x)]);
      // const holes = EarthUtils.convertSquaresToSlices(visitedLocations);
      this.setState({
        visitedLocations,
        holes,
      });

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
  }

  moveToLocation() {
    const { currentLocation, followLocation } = this.state;
    followLocation && this.map.animateToCoordinate(currentLocation, 500);
    // this.map.animateToNavigation(currentLocation, result.coords.heading, 0, 500);
  }

  render() {
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
          showsMyLocationButton={false}
          loadingBackgroundColor="#000000"
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
          <MapView.Polygon
            fillColor="rgba(0, 0, 0, 1)"
            strokeColor="rgba(0, 0, 0, 0)"
            coordinates={Earth.FOG}
            holes={holes}
          />
        </MapView>
        <InfoText style={styles.countryInfo} label={country} />
        <InfoText style={styles.regionInfo} label={region} />
        <InfoText style={styles.streetInfo} label={street} />
        <InfoText
          style={styles.tileInfo}
          label={visitedLocations.length}
          icon={iconSquare}
          alignRight
        />
        <InfoText style={styles.speedInfo} label={speed} icon={iconSpeed} alignRight />
        <InfoText style={styles.altitudeInfo} label={altitude} icon={iconAltitude} alignRight />
        {!followLocation && (
          <TouchableOpacity
            style={[styles.locationButton, { left: dimensions.width / 2 - 25 }]}
            onPress={() => {
              this.map.animateToCoordinate(currentLocation, 500);
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

export default Map;
