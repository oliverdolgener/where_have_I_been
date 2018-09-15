import React, { Component } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { DangerZone } from 'expo';

import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
import Map from '../components/Map';
import InfoText from '../components/InfoText';
import * as LevelUtils from '../utils/LevelUtils';
import * as MathUtils from '../utils/MathUtils';
import * as Colors from '../constants/Colors';
import iconMenu from '../assets/iconMenu.png';
import iconLevel from '../assets/iconLevel.png';
import iconLocation from '../assets/iconLocation.png';
import iconSquare from '../assets/iconSquare.png';
import iconSpeed from '../assets/iconSpeed.png';
import iconAltitude from '../assets/iconAltitude.png';
import iconClose from '../assets/iconClose.png';

const styles = {
  container: {
    flex: 1,
  },
  batterySaver: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.black,
  },
  menuButton: {
    position: 'absolute',
    top: 30,
    left: 10,
    borderRadius: 5,
    backgroundColor: Colors.white80,
  },
  menuImage: {
    width: 40,
    height: 40,
    tintColor: Colors.black80,
  },
  geocodeContainer: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  geocodeInfo: {
    marginBottom: 10,
  },
  levelInfo: {
    position: 'absolute',
    top: 30,
    right: 10,
  },
  tileInfo: {
    position: 'absolute',
    top: 70,
    right: 10,
  },
  speedInfo: {
    position: 'absolute',
    top: 110,
    right: 10,
  },
  altitudeInfo: {
    position: 'absolute',
    top: 150,
    right: 10,
  },
  locationButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  locationImage: {
    width: 50,
    height: 50,
    tintColor: Colors.lightBlue80,
  },
  removeImage: {
    width: 50,
    height: 50,
    tintColor: Colors.red80,
  },
};

class MapScreen extends Component {
  constructor() {
    super();
    this.state = {
      showBatterySaver: false,
    };
  }

  componentDidMount() {
    this.motionListener = DangerZone.DeviceMotion.addListener(result =>
      this.handleMotionEvent(result));
  }

  componentWillUnmount() {
    this.motionListener.remove();
  }

  handleMotionEvent(result) {
    const { powerSaver } = this.props;
    if (powerSaver === 'off') {
      return;
    }

    if (result.rotation && result.rotation.beta < -1) {
      this.setState({
        showBatterySaver: true,
      });
    } else if (result.rotation && result.rotation.beta > 1) {
      this.setState({
        showBatterySaver: false,
      });
    }
  }

  render() {
    const {
      visitedLocations,
      navigation,
      friendId,
      resetFriend,
      geolocation,
      geocode,
      followLocation,
      setFollowLocation,
      powerSaver,
    } = this.props;

    const { showBatterySaver } = this.state;

    const locations = MathUtils.gridToArray(visitedLocations);

    // const neighbours = MathUtils.gridToArray(props.visitedLocations).map(x => Coordinate.getNeighbours(x, props.visitedLocations).length + 1);
    // const score = neighbours.reduce((y, z) => y + z, 0);
    const level = LevelUtils.getLevelFromExp(locations.length);
    const gradient = LevelUtils.getPercentToNextLevel(locations.length);

    return (
      <View style={styles.container}>
        <Map
          onRef={(ref) => {
            this.map = ref;
          }}
        />
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Image style={styles.menuImage} source={iconMenu} />
        </TouchableOpacity>
        <View style={styles.geocodeContainer} pointerEvents="none">
          <InfoText style={styles.geocodeInfo} label={geocode.city} />
          <InfoText style={styles.geocodeInfo} label={geocode.region} />
          <InfoText style={styles.geocodeInfo} label={geocode.country} />
        </View>
        <InfoText
          style={styles.levelInfo}
          label={level}
          icon={iconLevel}
          alignRight
          gradient={gradient}
        />
        <InfoText style={styles.tileInfo} label={locations.length} icon={iconSquare} alignRight />
        <InfoText style={styles.speedInfo} label={geolocation.speed} icon={iconSpeed} alignRight />
        <InfoText
          style={styles.altitudeInfo}
          label={geolocation.altitude}
          icon={iconAltitude}
          alignRight
        />
        {friendId ? (
          <View style={styles.locationButton}>
            <TouchableOpacity onPress={() => resetFriend()}>
              <Image style={styles.removeImage} source={iconClose} />
            </TouchableOpacity>
          </View>
        ) : (
          !followLocation && (
            <View style={styles.locationButton}>
              <TouchableOpacity
                onPress={() => {
                  setFollowLocation(true);
                  this.map.moveToCurrentLocation();
                }}
              >
                <Image style={styles.locationImage} source={iconLocation} />
              </TouchableOpacity>
            </View>
          )
        )}
        {powerSaver === 'on' && showBatterySaver && <View style={styles.batterySaver} />}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  friendId: state.user.get('friendId'),
  visitedLocations: state.user.get('visitedLocations'),
  powerSaver: state.user.get('powerSaver'),
  geolocation: state.map.get('geolocation'),
  geocode: state.map.get('geocode'),
  followLocation: state.map.get('followLocation'),
});

const mapDispatchToProps = {
  resetFriend: userActions.resetFriend,
  setFollowLocation: mapActions.setFollowLocation,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapScreen);
