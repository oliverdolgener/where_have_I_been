import React from 'react';
import {
  StyleSheet,
  Animated,
  ScrollView,
  View,
  Text,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import Collapsible from 'react-native-collapsible';

import TouchableScale from './TouchableScale';
import Friendlist from './Friendlist';
import CountryList from './CountryList';
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
import iconEdit from '../assets/iconEdit.png';
import iconToggleOn from '../assets/iconToggleOn.png';
import iconToggleOff from '../assets/iconToggleOff.png';
import iconAirport from '../assets/iconAirport.png';
import iconUser from '../assets/iconLevel.png';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.creme,
  },
  menuContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
  },
  geocodeContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  geocodeCountry: {
    fontSize: 20,
    textAlign: 'right',
  },
  geocodeRegion: {
    fontSize: 18,
    textAlign: 'right',
  },
  geocodeCity: {
    fontSize: 16,
    textAlign: 'right',
  },
  menuItem: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
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
  badge: {
    justifyContent: 'center',
    height: 25,
    width: 30,
    borderWidth: 1,
    borderRadius: 5,
  },
  badgeLabel: {
    textAlign: 'center',
    fontSize: 16,
  },
});

class DrawerMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      showFriendlist: false,
      showCountryList: false,
      isSpinning: false,
      spinValue: new Animated.Value(0),
      friendlistIconValue: new Animated.Value(1),
      countriesIconValue: new Animated.Value(1),
    };
  }

  componentDidMount() {
    const { userId, getFriends, getCountries } = this.props;
    getFriends(userId);
    getCountries(userId);
  }

  componentDidUpdate() {
    const { isSaving } = this.props;
    const { isSpinning } = this.state;
    if (isSaving && !isSpinning) {
      this.spin();
    }
  }

  closeDrawer = () => {
    const { navigation } = this.props;
    navigation.closeDrawer();
    this.setState({
      showFriendlist: false,
      showCountryList: false,
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
      showCountryList: false,
    });
  };

  toggleCountryList = () => {
    const { showCountryList, countriesIconValue, friendlistIconValue } = this.state;
    showCountryList
      ? this.closeListAnimation(countriesIconValue)
      : this.openListAnimation(countriesIconValue);
    this.closeListAnimation(friendlistIconValue);
    this.setState({
      showCountryList: !showCountryList,
      showFriendlist: false,
    });
  };

  toggleFlights = () => {
    const { showFlights, setShowFlights } = this.props;
    this.closeDrawer();
    setShowFlights(!showFlights);
  }

  toggleCountries = () => {
    const { showCountries, setShowCountries } = this.props;
    this.closeDrawer();
    setShowCountries(!showCountries);
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
    const { getFriendLocations, getFriendFlights } = this.props;
    this.closeDrawer();
    getFriendLocations(id);
    getFriendFlights(id);
  }

  showCountry(region) {
    const { map, setFollowLocation } = this.props;
    map && map.moveToRegion(region);
    setFollowLocation(false);
    this.closeDrawer();
  }

  render() {
    const {
      mapType, tilesToSave, theme, powerSaver, editMode, showFlights, showCountries, geocode,
    } = this.props;
    const {
      showFriendlist,
      showCountryList,
      spinValue,
      friendlistIconValue,
      countriesIconValue,
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
            <View style={styles.header}>
              <Image style={styles.avatar} source={iconUser} />
              <View style={styles.geocodeContainer}>
                <Text style={styles.geocodeCountry} ellipsizeMode="middle" numberOfLines={1}>{geocode.country}</Text>
                <Text style={styles.geocodeRegion} ellipsizeMode="middle" numberOfLines={1}>{geocode.region}</Text>
                <Text style={styles.geocodeCity} ellipsizeMode="middle" numberOfLines={1}>{geocode.city}</Text>
              </View>
            </View>
            <TouchableScale style={styles.menuItem} onPress={() => this.toggleMapType()}>
              <Image style={styles.menuIcon} source={iconMap} />
              <Text style={styles.menuLabel}>Map Type</Text>
              <Image style={styles.menuIcon} source={mapType === 'standard' ? iconStreetView : iconSatellite} />
            </TouchableScale>
            <TouchableScale style={styles.menuItem} onPress={() => this.toggleFriendlist()}>
              <Image style={styles.menuIcon} source={iconFriendlist} />
              <Text style={styles.menuLabel}>Friendlist</Text>
              <Animated.View style={{ transform: [{ rotateX: friendlistFlip }] }}>
                <Image style={styles.menuIcon} source={iconCollapse} />
              </Animated.View>
            </TouchableScale>
            <Collapsible collapsed={!showFriendlist}>
              <Friendlist onFriendPress={id => this.showFriend(id)} />
            </Collapsible>
            <TouchableScale style={styles.menuItem} onPress={() => this.toggleCountryList()}>
              <Image style={styles.menuIcon} source={iconWorld} />
              <Text style={styles.menuLabel}>Countries</Text>
              <Animated.View style={{ transform: [{ rotateX: countriesFlip }] }}>
                <Image style={styles.menuIcon} source={iconCollapse} />
              </Animated.View>
            </TouchableScale>
            <Collapsible collapsed={!showCountryList}>
              <CountryList
                onCountryPress={region => this.showCountry(region)}
                onStatusPress={country => this.toggleVacation(country)}
              />
            </Collapsible>
            <TouchableScale style={styles.menuItem} onPress={() => this.syncData()}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Image style={styles.menuIcon} source={iconSync} />
              </Animated.View>
              <Text style={styles.menuLabel}>Sync Data</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>{tilesToSave.length}</Text>
              </View>
            </TouchableScale>
            <TouchableScale style={styles.menuItem} onPress={() => this.toggleFlights()}>
              <Image style={styles.menuIcon} source={iconAirport} />
              <Text style={styles.menuLabel}>Show Flights</Text>
              <Image style={styles.menuIcon} source={showFlights ? iconToggleOn : iconToggleOff} />
            </TouchableScale>
            <TouchableScale style={styles.menuItem} onPress={() => this.toggleCountries()}>
              <Image style={styles.menuIcon} source={iconMap} />
              <Text style={styles.menuLabel}>Show Countries</Text>
              <Image style={styles.menuIcon} source={showCountries ? iconToggleOn : iconToggleOff} />
            </TouchableScale>
            <TouchableScale style={styles.menuItem} onPress={() => this.toggleTheme()}>
              <Image style={styles.menuIcon} source={iconNight} />
              <Text style={styles.menuLabel}>Night Mode</Text>
              <Image style={styles.menuIcon} source={theme === 'dark' ? iconToggleOn : iconToggleOff} />
            </TouchableScale>
            <TouchableScale style={styles.menuItem} onPress={() => this.togglePowerSaver()}>
              <Image style={styles.menuIcon} source={iconPowerSaver} />
              <Text style={styles.menuLabel}>Power Saver</Text>
              <Image style={styles.menuIcon} source={powerSaver === 'on' ? iconToggleOn : iconToggleOff} />
            </TouchableScale>
            <TouchableScale style={styles.menuItem} onPress={() => this.toggleEditMode()}>
              <Image style={styles.menuIcon} source={iconEdit} />
              <Text style={styles.menuLabel}>Edit Mode</Text>
              <Image style={styles.menuIcon} source={editMode ? iconToggleOn : iconToggleOff} />
            </TouchableScale>
            <TouchableScale style={styles.menuItem} onPress={() => this.logout()}>
              <Image style={styles.menuIcon} source={iconLogout} />
              <Text style={styles.menuLabel}>Logout</Text>
            </TouchableScale>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  userId: state.user.get('userId'),
  tilesToSave: state.user.get('tilesToSave'),
  isSaving: state.user.get('isSaving'),
  map: state.map.get('map'),
  mapType: state.map.get('mapType'),
  theme: state.map.get('theme'),
  geocode: state.map.get('geocode'),
  powerSaver: state.map.get('powerSaver'),
  editMode: state.map.get('editMode'),
  showFlights: state.map.get('showFlights'),
  showCountries: state.map.get('showCountries'),
});

const mapDispatchToProps = {
  getFriends: userActions.getFriends,
  getFriendLocations: userActions.getFriendLocations,
  getFriendFlights: userActions.getFriendFlights,
  logout: userActions.logout,
  saveTiles: userActions.saveTiles,
  setPowerSaver: mapActions.setPowerSaver,
  setMapType: mapActions.setMapType,
  setTheme: mapActions.setTheme,
  getCountries: mapActions.getCountries,
  setFollowLocation: mapActions.setFollowLocation,
  setEditMode: mapActions.setEditMode,
  setShowFlights: mapActions.setShowFlights,
  setShowCountries: mapActions.setShowCountries,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DrawerMenu);
