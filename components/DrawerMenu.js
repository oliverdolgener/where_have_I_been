import React from 'react';
import {
  StyleSheet,
  Animated,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import Collapsible from 'react-native-collapsible';

import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
import ThemedText from './ThemedText';
import ThemedTextInput from './ThemedTextInput';
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
      friends, countries, mapType, tilesToSave, theme, powerSaver, editMode,
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
              <ThemedText style={styles.menuLabel}>Map Type</ThemedText>
              <Image style={styles.menuIcon} source={mapType === 'standard' ? iconStreetView : iconSatellite} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleFriendlist()}>
              <Image style={styles.menuIcon} source={iconFriendlist} />
              <ThemedText style={styles.menuLabel}>Friendlist</ThemedText>
              <Animated.View style={{ transform: [{ rotateX: friendlistFlip }] }}>
                <Image style={styles.menuIcon} source={iconCollapse} />
              </Animated.View>
            </TouchableOpacity>
            <Collapsible collapsed={!showFriendlist}>
              <View style={styles.listItem}>
                <ThemedTextInput
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
                  <ThemedText style={styles.menuBadge}>{x.level}</ThemedText>
                  <ThemedText style={styles.listLabel}>{x.username}</ThemedText>
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
              <ThemedText style={styles.menuLabel}>Countries</ThemedText>
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
                  <ThemedText style={styles.listLabel}>{x.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </Collapsible>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.syncData()}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Image style={styles.menuIcon} source={iconSync} />
              </Animated.View>
              <ThemedText style={styles.menuLabel}>Sync Data</ThemedText>
              <ThemedText style={styles.menuBadge}>{tilesToSave.length}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleTheme()}>
              <Image style={styles.menuIcon} source={iconNight} />
              <ThemedText style={styles.menuLabel}>Night Mode</ThemedText>
              <Image style={styles.menuIcon} source={theme === 'dark' ? iconToggleOn : iconToggleOff} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.togglePowerSaver()}>
              <Image style={styles.menuIcon} source={iconPowerSaver} />
              <ThemedText style={styles.menuLabel}>Power Saver</ThemedText>
              <Image style={styles.menuIcon} source={powerSaver === 'on' ? iconToggleOn : iconToggleOff} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleEditMode()}>
              <Image style={styles.menuIcon} source={iconEdit} />
              <ThemedText style={styles.menuLabel}>Edit Mode</ThemedText>
              <Image style={styles.menuIcon} source={editMode ? iconToggleOn : iconToggleOff} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.logout()}>
              <Image style={styles.menuIcon} source={iconLogout} />
              <ThemedText style={styles.menuLabel}>Logout</ThemedText>
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
  mapType: state.user.get('mapType'),
  tilesToSave: state.user.get('tilesToSave'),
  theme: state.user.get('theme'),
  isSaving: state.user.get('isSaving'),
  powerSaver: state.user.get('powerSaver'),
  friendError: state.user.get('friendError'),
  map: state.map.get('map'),
  countries: state.map.get('countries'),
  editMode: state.map.get('editMode'),
});

const mapDispatchToProps = {
  getFriends: userActions.getFriends,
  addFriend: userActions.addFriend,
  removeFriend: userActions.removeFriend,
  getFriend: userActions.getFriend,
  logout: userActions.logout,
  setMapType: userActions.setMapType,
  saveTiles: userActions.saveTiles,
  setTheme: userActions.setTheme,
  setPowerSaver: userActions.setPowerSaver,
  getCountries: mapActions.getCountries,
  setFollowLocation: mapActions.setFollowLocation,
  setEditMode: mapActions.setEditMode,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DrawerMenu);
