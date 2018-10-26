import React from 'react';
import {
  StyleSheet,
  Animated,
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import Collapsible from 'react-native-collapsible';

import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
import * as Colors from '../constants/Colors';
import iconMap from '../assets/iconMap.png';
import iconStreetView from '../assets/iconStreetView.png';
import iconSatellite from '../assets/iconSatellite.png';
import iconFriendlist from '../assets/iconFriendlist.png';
import iconCollapse from '../assets/iconCollapse.png';
import iconWorld from '../assets/iconWorld.png';
import iconSync from '../assets/iconSync.png';
import iconNight from '../assets/iconNight.png';
import iconLogout from '../assets/iconLogout.png';
import iconPowerSaver from '../assets/iconPowerSaver.png';
import iconAdd from '../assets/iconAdd.png';
import iconRemove from '../assets/iconRemove.png';
import iconEdit from '../assets/iconEdit.png';
import iconToggleOn from '../assets/iconToggleOn.png';
import iconToggleOff from '../assets/iconToggleOff.png';
import iconAirport from '../assets/iconAirport.png';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginBottom: 20,
  },
  menuIcon: {
    width: 30,
    height: 30,
  },
  menuLabel: {
    flex: 1,
    marginLeft: 15,
    fontSize: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    marginBottom: 15,
  },
  listIcon: {
    width: 25,
    height: 25,
  },
  listLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 20,
  },
  menuBadge: {
    height: 25,
    width: 30,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
  },
  addFriend: {
    height: 40,
    flex: 1,
    marginLeft: 20,
    fontSize: 20,
  },
});

class DrawerMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      showFriendlist: false,
      showCountries: false,
      isSpinning: false,
      spinValue: new Animated.Value(0),
      friendlistIconValue: new Animated.Value(1),
      countriesIconValue: new Animated.Value(1),
      friendName: '',
    };
  }

  componentDidMount() {
    const { userId, getFriends, getCountries } = this.props;
    getFriends(userId);
    getCountries();
  }

  componentDidUpdate() {
    const { isSaving } = this.props;
    const { isSpinning } = this.state;
    if (isSaving && !isSpinning) {
      this.spin();
    }
  }

  onAddFriend() {
    const { userId, addFriend } = this.props;
    const { friendName } = this.state;
    if (friendName) {
      addFriend(userId, friendName);
      this.setState({
        friendName: '',
      });
    }
  }

  onRemoveFriend(friendId) {
    const { userId, removeFriend } = this.props;
    removeFriend(userId, friendId);
  }

  onChangeFriendName(friendName) {
    this.setState({
      friendName,
    });
  }

  closeDrawer = () => {
    const { navigation } = this.props;
    navigation.closeDrawer();
    this.setState({
      showFriendlist: false,
      showCountries: false,
    });
  };

  toggleTheme = () => {
    const { theme, setTheme } = this.props;
    this.closeDrawer();
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  togglePowerSaver = () => {
    const { powerSaver, setPowerSaver } = this.props;
    this.closeDrawer();
    setPowerSaver(powerSaver === 'on' ? 'off' : 'on');
  };

  toggleMapType = () => {
    const { mapType, setMapType } = this.props;
    this.closeDrawer();
    switch (mapType) {
      case 'hybrid':
        setMapType('standard');
        break;
      case 'standard':
        setMapType('hybrid');
        break;
      default:
        setMapType('hybrid');
        break;
    }
  };

  toggleFriendlist = () => {
    const { showFriendlist, friendlistIconValue, countriesIconValue } = this.state;
    showFriendlist
      ? this.closeListAnimation(friendlistIconValue)
      : this.openListAnimation(friendlistIconValue);
    this.closeListAnimation(countriesIconValue);
    this.setState({
      showFriendlist: !showFriendlist,
      showCountries: false,
    });
  };

  toggleCountries = () => {
    const { showCountries, countriesIconValue, friendlistIconValue } = this.state;
    showCountries
      ? this.closeListAnimation(countriesIconValue)
      : this.openListAnimation(countriesIconValue);
    this.closeListAnimation(friendlistIconValue);
    this.setState({
      showCountries: !showCountries,
      showFriendlist: false,
    });
  };

  toggleFlights = () => {
    const { showFlights, setShowFlights } = this.props;
    this.closeDrawer();
    setShowFlights(!showFlights);
  }

  toggleEditMode = () => {
    const { editMode, setEditMode } = this.props;
    this.closeDrawer();
    setEditMode(!editMode);
  };

  logout = async () => {
    const { logout } = this.props;
    this.closeDrawer();
    logout();
  };

  openListAnimation = (value) => {
    Animated.timing(value, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  closeListAnimation = (value) => {
    Animated.timing(value, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  syncData() {
    const {
      userId, tilesToSave, saveTiles, isSaving,
    } = this.props;
    if (!isSaving && tilesToSave.length > 0) {
      saveTiles(userId, tilesToSave);
    }
  }

  spin() {
    const { spinValue } = this.state;
    this.setState({ isSpinning: true });
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      const { isSaving } = this.props;
      if (isSaving) {
        this.spin();
      } else {
        this.setState({ isSpinning: false });
      }
    });
  }

  showFriend(id) {
    const { getFriend } = this.props;
    this.closeDrawer();
    getFriend(id);
  }

  showCountry(region) {
    const { map, setFollowLocation } = this.props;
    map && map.moveToRegion(region);
    setFollowLocation(false);
    this.closeDrawer();
  }

  render() {
    const {
      friends, countries, mapType, tilesToSave, theme, powerSaver, editMode, showFlights,
    } = this.props;
    const {
      showFriendlist,
      showCountries,
      spinValue,
      friendlistIconValue,
      countriesIconValue,
      friendName,
    } = this.state;

    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['360deg', '0deg'],
    });

    const friendlistFlip = friendlistIconValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    const countriesFlip = countriesIconValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <SafeAreaView
        style={styles.container}
        forceInset={{ top: 'always', horizontal: 'never' }}
      >
        <ScrollView>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleMapType()}>
              <Image style={styles.menuIcon} source={iconMap} />
              <Text style={styles.menuLabel}>Map Type</Text>
              <Image style={styles.menuIcon} source={mapType === 'standard' ? iconStreetView : iconSatellite} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleFriendlist()}>
              <Image style={styles.menuIcon} source={iconFriendlist} />
              <Text style={styles.menuLabel}>Friendlist</Text>
              <Animated.View style={{ transform: [{ rotateX: friendlistFlip }] }}>
                <Image style={styles.menuIcon} source={iconCollapse} />
              </Animated.View>
            </TouchableOpacity>
            <Collapsible collapsed={!showFriendlist}>
              <View style={styles.listItem}>
                <TextInput
                  style={styles.addFriend}
                  placeholder="Add Friend"
                  onChangeText={text => this.onChangeFriendName(text)}
                  value={friendName}
                  onSubmitEditing={() => this.onAddFriend()}
                />
                <TouchableOpacity onPress={() => this.onAddFriend()}>
                  <Image style={styles.listIcon} source={iconAdd} />
                </TouchableOpacity>
              </View>
              {friends.map(x => (
                <TouchableOpacity
                  style={styles.listItem}
                  key={x.id}
                  onPress={() => this.showFriend(x.id)}
                >
                  <Text style={styles.menuBadge}>{x.level}</Text>
                  <Text style={styles.listLabel}>{x.username}</Text>
                  <TouchableOpacity onPress={() => this.onRemoveFriend(x.id)}>
                    <Image
                      style={styles.listIcon}
                      source={iconRemove}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </Collapsible>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleCountries()}>
              <Image style={styles.menuIcon} source={iconWorld} />
              <Text style={styles.menuLabel}>Countries</Text>
              <Animated.View style={{ transform: [{ rotateX: countriesFlip }] }}>
                <Image style={styles.menuIcon} source={iconCollapse} />
              </Animated.View>
            </TouchableOpacity>
            <Collapsible collapsed={!showCountries}>
              {countries.map(x => (
                <TouchableOpacity
                  style={styles.listItem}
                  key={x.id}
                  onPress={() => this.showCountry(x.region)}
                >
                  <Text style={styles.listLabel}>{x.name}</Text>
                </TouchableOpacity>
              ))}
            </Collapsible>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.syncData()}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Image style={styles.menuIcon} source={iconSync} />
              </Animated.View>
              <Text style={styles.menuLabel}>Sync Data</Text>
              <Text style={styles.menuBadge}>{tilesToSave.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleFlights()}>
              <Image style={styles.menuIcon} source={iconAirport} />
              <Text style={styles.menuLabel}>Show Flights</Text>
              <Image style={styles.menuIcon} source={showFlights ? iconToggleOn : iconToggleOff} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleTheme()}>
              <Image style={styles.menuIcon} source={iconNight} />
              <Text style={styles.menuLabel}>Night Mode</Text>
              <Image style={styles.menuIcon} source={theme === 'dark' ? iconToggleOn : iconToggleOff} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.togglePowerSaver()}>
              <Image style={styles.menuIcon} source={iconPowerSaver} />
              <Text style={styles.menuLabel}>Power Saver</Text>
              <Image style={styles.menuIcon} source={powerSaver === 'on' ? iconToggleOn : iconToggleOff} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleEditMode()}>
              <Image style={styles.menuIcon} source={iconEdit} />
              <Text style={styles.menuLabel}>Edit Mode</Text>
              <Image style={styles.menuIcon} source={editMode ? iconToggleOn : iconToggleOff} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.logout()}>
              <Image style={styles.menuIcon} source={iconLogout} />
              <Text style={styles.menuLabel}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  userId: state.user.get('userId'),
  friends: state.user.get('friends'),
  tilesToSave: state.user.get('tilesToSave'),
  isSaving: state.user.get('isSaving'),
  friendError: state.user.get('friendError'),
  map: state.map.get('map'),
  mapType: state.map.get('mapType'),
  theme: state.map.get('theme'),
  powerSaver: state.map.get('powerSaver'),
  countries: state.map.get('countries'),
  editMode: state.map.get('editMode'),
  showFlights: state.map.get('showFlights'),
});

const mapDispatchToProps = {
  getFriends: userActions.getFriends,
  addFriend: userActions.addFriend,
  removeFriend: userActions.removeFriend,
  getFriend: userActions.getFriend,
  logout: userActions.logout,
  saveTiles: userActions.saveTiles,
  setPowerSaver: mapActions.setPowerSaver,
  setMapType: mapActions.setMapType,
  setTheme: mapActions.setTheme,
  getCountries: mapActions.getCountries,
  setFollowLocation: mapActions.setFollowLocation,
  setEditMode: mapActions.setEditMode,
  setShowFlights: mapActions.setShowFlights,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DrawerMenu);
