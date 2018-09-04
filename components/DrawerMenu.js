import React from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, Switch } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import Collapsible from 'react-native-collapsible';

import { actions as userActions } from '../reducers/user';
import ThemedText from '../components/ThemedText';
import ThemedIcon from '../components/ThemedIcon';
import * as Colors from '../constants/Colors';
import iconMap from '../assets/iconMap.png';
import iconSatellite from '../assets/iconSatellite.png';
import iconWatercolor from '../assets/iconWatercolor.png';
import iconFriendlist from '../assets/iconFriendlist.png';
import iconCollapse from '../assets/iconCollapse.png';
import iconExpand from '../assets/iconExpand.png';
import iconWorld from '../assets/iconWorld.png';
import iconSync from '../assets/iconSync.png';
import iconNight from '../assets/iconNight.png';
import iconLogout from '../assets/iconLogout.png';

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
    flex: 1,
    marginLeft: 20,
    fontSize: 24,
  },
  menuBadge: {
    padding: 3,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
  },
});

class DrawerMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      showFriendlist: false,
      showCountries: false,
    };
  }

  toggleTheme = () => {
    const { theme, setTheme } = this.props;
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  toggleMapType = () => {
    const { navigation, mapType, setMapType } = this.props;
    navigation.closeDrawer();
    switch (mapType) {
      case 'hybrid':
        setMapType('standard');
        break;
      case 'standard':
        setMapType('watercolor');
        break;
      case 'watercolor':
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

  syncData() {
    const {
      userId, getUser, tilesToSave, saveTiles, navigation, isSaving,
    } = this.props;
    navigation.closeDrawer();
    if (!isSaving && tilesToSave.length > 0) {
      saveTiles(userId, tilesToSave);
      setTimeout(() => {
        getUser(userId);
      }, 3000);
    }
  }

  logout = async () => {
    const { logout, navigation } = this.props;
    navigation.closeDrawer();
    logout();
  };

  showFriend(id) {
    const { getFriend, navigation } = this.props;
    navigation.closeDrawer();
    getFriend(id);
  }

  render() {
    const { mapType, tilesToSave, theme } = this.props;
    const { showFriendlist, showCountries } = this.state;

    const backgroundColor = theme === 'dark' ? Colors.black80 : Colors.white80;

    let mapTypeIcon;
    switch (mapType) {
      case 'hybrid':
        mapTypeIcon = iconSatellite;
        break;
      case 'standard':
        mapTypeIcon = iconMap;
        break;
      case 'watercolor':
        mapTypeIcon = iconWatercolor;
        break;
      default:
        mapTypeIcon = iconSatellite;
        break;
    }

    const testFriends = [
      {
        id: '5ae9c419728f801904a9624e',
        username: '0llum',
        tiles: 10000,
        level: 21,
      },
      {
        id: '5aeae9800a576c69ca1e023b',
        username: 'Liz',
        tiles: 36,
        level: 3,
      },
      {
        id: '5b675aa93d4ee00f1f4e2adf',
        username: 'Ute',
        tiles: 4321,
        level: 16,
      },
    ];

    const testCountries = [
      { id: 0, name: 'Germany' },
      { id: 1, name: 'Croatia' },
      { id: 2, name: 'Czech Republic' },
    ];

    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor }]}
        forceInset={{ top: 'always', horizontal: 'never' }}
      >
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
          <Collapsible collapsed={!showFriendlist} collapsedHeight={0}>
            <FlatList
              data={testFriends}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.menuItem} onPress={() => this.showFriend(item.id)}>
                  <ThemedText style={styles.menuLabel}>{item.username}</ThemedText>
                  <ThemedText style={styles.menuBadge}>{item.level}</ThemedText>
                </TouchableOpacity>
              )}
            />
          </Collapsible>
          <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleCountries()}>
            <ThemedIcon style={styles.menuIcon} source={iconWorld} />
            <ThemedText style={styles.menuLabel}>Countries</ThemedText>
            <ThemedIcon
              style={styles.menuIcon}
              source={showCountries ? iconCollapse : iconExpand}
            />
          </TouchableOpacity>
          <Collapsible collapsed={!showCountries} collapsedHeight={0}>
            <FlatList
              data={testCountries}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.menuItem}>
                  <ThemedText style={styles.menuLabel}>{item.name}</ThemedText>
                </TouchableOpacity>
              )}
            />
          </Collapsible>
          <TouchableOpacity style={styles.menuItem} onPress={() => this.syncData()}>
            <ThemedIcon style={styles.menuIcon} source={iconSync} />
            <ThemedText style={styles.menuLabel}>Sync Data</ThemedText>
            <ThemedText style={styles.menuBadge}>{tilesToSave.length}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleTheme()}>
            <ThemedIcon style={styles.menuIcon} source={iconNight} />
            <ThemedText style={styles.menuLabel}>Night Mode</ThemedText>
            <Switch value={theme === 'dark'} onValueChange={() => this.toggleTheme()} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => this.logout()}>
            <ThemedIcon style={styles.menuIcon} source={iconLogout} />
            <ThemedText style={styles.menuLabel}>Logout</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  userId: state.user.get('userId'),
  mapType: state.user.get('mapType'),
  tilesToSave: state.user.get('tilesToSave'),
  theme: state.user.get('theme'),
  isSaving: state.user.get('isSaving'),
});

const mapDispatchToProps = {
  getUser: userActions.getUser,
  getFriend: userActions.getFriend,
  logout: userActions.logout,
  setMapType: userActions.setMapType,
  saveTiles: userActions.saveTiles,
  setTheme: userActions.setTheme,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DrawerMenu);
