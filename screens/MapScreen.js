import React, { Component } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import { DangerZone } from 'expo';
import ProgressBar from 'react-native-progress/Bar';

import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
import Map from '../components/Map';
import * as LevelUtils from '../utils/LevelUtils';
import * as MathUtils from '../utils/MathUtils';
import * as Colors from '../constants/Colors';
import iconMenu from '../assets/iconMenu.png';
import iconLevel from '../assets/iconLevel.png';
import iconLocation from '../assets/iconLocation.png';
import iconSquare from '../assets/iconSquare.png';
import iconSpeed from '../assets/iconSpeed.png';
import iconAltitude from '../assets/iconAltitude.png';
import iconClose from '../assets/iconRemove.png';

const styles = {
  container: {
    flex: 1,
  },
  toolbar: {
    width: '100%',
    height: 30,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  toolbarItem: {
    flex: 3,
    flexDirection: 'row',
  },
  toolbarIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  toolbarLabel: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    marginRight: 10,
  },
  separator: {
    height: '100%',
    borderWidth: 0.5,
    borderColor: Colors.black,
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
  },
  menuImage: {
    width: 50,
    height: 50,
  },
  actionButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 50,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
  },
  flightBox: {
    position: 'absolute',
    top: 30,
    right: 10,
    width: 100,
    backgroundColor: Colors.white,
  },
  flightInput: {
    margin: 5,
    paddingHorizontal: 5,
    height: 40,
  },
  flightButton: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: Colors.blue,
  },
  flightButtonLabel: {
    color: Colors.white,
  },
};

class MapScreen extends Component {
  constructor() {
    super();
    this.state = {
      showBatterySaver: false,
      from: '',
      to: '',
    };
  }

  componentDidMount() {
    this.motionListener = DangerZone.DeviceMotion.addListener(result => this.handleMotionEvent(result));
    DangerZone.DeviceMotion.setUpdateInterval(1000);
  }

  componentWillUnmount() {
    this.motionListener.remove();
  }

  onAddFlight() {
    const { addFlight, userId } = this.props;
    const { from, to } = this.state;
    if (!from) {
      return;
    }
    if (!to) {
      return;
    }

    addFlight(userId, from, to);

    this.setState({
      from: '',
      to: '',
    });
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
      followLocation,
      setFollowLocation,
      powerSaver,
      editMode,
    } = this.props;

    const { showBatterySaver, from, to } = this.state;

    const locations = MathUtils.gridToArray(visitedLocations);
    const level = LevelUtils.getLevelFromExp(locations.length);
    const progress = LevelUtils.getPercentToNextLevel(locations.length);

    return (
      <View style={styles.container}>
        <Map />
        <View style={styles.toolbar}>
          <View style={styles.toolbarItem}>
            <Image style={styles.toolbarIcon} source={iconLevel} />
            <Text style={styles.toolbarLabel}>{level}</Text>
          </View>
          <View style={styles.separator} />
          <View style={[styles.toolbarItem, { flex: 5 }]}>
            <Image style={styles.toolbarIcon} source={iconSquare} />
            <Text style={styles.toolbarLabel}>{locations.length}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.toolbarItem}>
            <Image style={styles.toolbarIcon} source={iconSpeed} />
            <Text style={styles.toolbarLabel}>{geolocation.speed || 0}</Text>
          </View>
          <View style={styles.separator} />
          <View style={[styles.toolbarItem, { flex: 4 }]}>
            <Image style={styles.toolbarIcon} source={iconAltitude} />
            <Text style={styles.toolbarLabel}>{geolocation.altitude || 0}</Text>
          </View>
        </View>
        <ProgressBar
          progress={progress}
          width={null}
          height={5}
          borderRadius={0}
          borderWidth={0}
          unfilledColor={Colors.white}
          color={Colors.blue}
          useNativeDriver
        />
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Image style={styles.menuImage} source={iconMenu} />
        </TouchableOpacity>
        {friendId ? (
          <View style={styles.actionButton}>
            <TouchableOpacity onPress={() => resetFriend()}>
              <Image style={styles.actionIcon} source={iconClose} />
            </TouchableOpacity>
          </View>
        ) : (
          !followLocation && (
            <View style={styles.actionButton}>
              <TouchableOpacity
                onPress={() => {
                  const { map } = this.props;
                  map && map.moveToCurrentLocation();
                  setFollowLocation(true);
                }}
              >
                <Image style={styles.actionIcon} source={iconLocation} />
              </TouchableOpacity>
            </View>
          )
        )}
        {editMode && (
          <View style={styles.flightBox}>
            <TextInput
              style={styles.flightInput}
              placeholder="From"
              onChangeText={text => this.setState({ from: text })}
              value={from}
              selectionColor={Colors.blue}
              underlineColorAndroid={Colors.blue}
              returnKeyType="next"
              onSubmitEditing={() => this.toInput.focus()}
              autoCorrect={false}
              autoCapitalize="characters"
            />
            <TextInput
              ref={(ref) => {
                this.toInput = ref;
              }}
              style={styles.flightInput}
              placeholder="To"
              onChangeText={text => this.setState({ to: text })}
              value={to}
              selectionColor={Colors.blue}
              underlineColorAndroid={Colors.blue}
              returnKeyType="send"
              onSubmitEditing={() => this.onAddFlight()}
              autoCorrect={false}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.flightButton} onPress={() => this.onAddFlight()}>
              <Text style={styles.flightButtonLabel}>Add Flight</Text>
            </TouchableOpacity>
          </View>
        )}
        {powerSaver === 'on' && showBatterySaver && <View style={styles.batterySaver} />}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  userId: state.user.get('userId'),
  friendId: state.user.get('friendId'),
  visitedLocations: state.user.get('visitedLocations'),
  powerSaver: state.user.get('powerSaver'),
  map: state.map.get('map'),
  geolocation: state.map.get('geolocation'),
  geocode: state.map.get('geocode'),
  followLocation: state.map.get('followLocation'),
  editMode: state.map.get('editMode'),
});

const mapDispatchToProps = {
  resetFriend: userActions.resetFriend,
  addFlight: userActions.addFlight,
  setFollowLocation: mapActions.setFollowLocation,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapScreen);
