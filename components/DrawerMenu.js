import React from 'react';
import {
  StyleSheet, Animated, ScrollView, View, Image, TouchableOpacity, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import Collapsible from 'react-native-collapsible';

import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
import ThemedText from './ThemedText';
import ThemedIcon from './ThemedIcon';
import ThemedTextInput from './ThemedTextInput';
import * as Colors from '../constants/Colors';
import iconMap from '../assets/iconMap.png';
import iconSatellite from '../assets/iconSatellite.png';
import iconFriendlist from '../assets/iconFriendlist.png';
import iconCollapse from '../assets/iconCollapse.png';
import iconExpand from '../assets/iconExpand.png';
import iconWorld from '../assets/iconWorld.png';
import iconSync from '../assets/iconSync.png';
import iconNight from '../assets/iconNight.png';
import iconLogout from '../assets/iconLogout.png';
import iconPowerSaver from '../assets/iconPowerSaver.png';
import iconAdd from '../assets/iconAdd.png';
import iconRemove from '../assets/iconRemove.png';
import iconEdit from '../assets/iconEdit.png';

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    height: 30,
    flex: 1,
    marginLeft: 20,
    fontSize: 20,
  },
  menuBadge: {
    padding: 3,
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
    const { showFriendlist } = this.state;
    this.setState({
      showFriendlist: !showFriendlist,
      showCountries: false,
    });
  };

  toggleCountries = () => {
    const { showCountries } = this.state;
    this.setState({
      showCountries: !showCountries,
      showFriendlist: false,
    });
  };

  toggleEditMode = () => {
    const { editMode, setEditMode } = this.props;
    this.closeDrawer();
    setEditMode(!editMode);
  }

  logout = async () => {
    const { logout } = this.props;
    this.closeDrawer();
    logout();
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
      showFriendlist, showCountries, spinValue, friendName,
    } = this.state;

    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['360deg', '0deg'],
    });

    const backgroundColor = theme === 'dark' ? Colors.black80 : Colors.white80;

    let mapTypeIcon;
    switch (mapType) {
      case 'hybrid':
        mapTypeIcon = iconSatellite;
        break;
      case 'standard':
        mapTypeIcon = iconMap;
        break;
      default:
        mapTypeIcon = iconSatellite;
        break;
    }

    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor }]}
        forceInset={{ top: 'always', horizontal: 'never' }}
      >
        <ScrollView>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleMapType()}>
              <ThemedIcon style={styles.menuIcon} source={iconMap} />
              <ThemedText style={styles.menuLabel}>Map Type</ThemedText>
              <ThemedIcon style={styles.menuIcon} source={mapTypeIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleFriendlist()}>
              <ThemedIcon style={styles.menuIcon} source={iconFriendlist} />
              <ThemedText style={styles.menuLabel}>Friendlist</ThemedText>
              <ThemedIcon
                style={styles.menuIcon}
                source={showFriendlist ? iconCollapse : iconExpand}
              />
            </TouchableOpacity>
            <Collapsible collapsed={!showFriendlist}>
              <View style={styles.menuItem}>
                <ThemedTextInput
                  style={styles.addFriend}
                  placeholder="Add Friend"
                  onChangeText={text => this.onChangeFriendName(text)}
                  value={friendName}
                  onSubmitEditing={() => this.onAddFriend()}
                />
                <TouchableOpacity onPress={() => this.onAddFriend()}>
                  <ThemedIcon style={styles.menuIcon} source={iconAdd} />
                </TouchableOpacity>
              </View>
              {friends.map(x => (
                <TouchableOpacity
                  style={styles.menuItem}
                  key={x.id}
                  onPress={() => this.showFriend(x.id)}
                >
                  <ThemedText style={styles.menuLabel}>{x.username}</ThemedText>
                  <ThemedText style={styles.menuBadge}>{x.level}</ThemedText>
                  <TouchableOpacity onPress={() => this.onRemoveFriend(x.id)}>
                    <Image style={[styles.menuIcon, { tintColor: Colors.red }]} source={iconRemove} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </Collapsible>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleCountries()}>
              <ThemedIcon style={styles.menuIcon} source={iconWorld} />
              <ThemedText style={styles.menuLabel}>Countries</ThemedText>
              <ThemedIcon
                style={styles.menuIcon}
                source={showCountries ? iconCollapse : iconExpand}
              />
            </TouchableOpacity>
            <Collapsible collapsed={!showCountries}>
              {countries.map(x => (
                <TouchableOpacity
                  style={styles.menuItem}
                  key={x.id}
                  onPress={() => this.showCountry(x.region)}
                >
                  <ThemedText style={styles.menuLabel}>{x.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </Collapsible>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.syncData()}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <ThemedIcon style={styles.menuIcon} source={iconSync} />
              </Animated.View>
              <ThemedText style={styles.menuLabel}>Sync Data</ThemedText>
              <ThemedText style={styles.menuBadge}>{tilesToSave.length}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleTheme()}>
              <ThemedIcon style={styles.menuIcon} source={iconNight} />
              <ThemedText style={styles.menuLabel}>Night Mode</ThemedText>
              <Switch value={theme === 'dark'} onValueChange={() => this.toggleTheme()} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.togglePowerSaver()}>
              <ThemedIcon style={styles.menuIcon} source={iconPowerSaver} />
              <ThemedText style={styles.menuLabel}>Power Saver</ThemedText>
              <Switch value={powerSaver === 'on'} onValueChange={() => this.togglePowerSaver()} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleEditMode()}>
              <ThemedIcon style={styles.menuIcon} source={iconEdit} />
              <ThemedText style={styles.menuLabel}>Edit Mode</ThemedText>
              <Switch value={editMode} onValueChange={() => this.toggleEditMode()} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => this.logout()}>
              <ThemedIcon style={styles.menuIcon} source={iconLogout} />
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
