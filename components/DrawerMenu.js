import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import Collapsible from 'react-native-collapsible';

import { actions as userActions } from '../reducers/user';
import * as Colors from '../constants/Colors';
import iconMap from '../assets/iconMap.png';
import iconSatellite from '../assets/iconSatellite.png';
import iconWatercolor from '../assets/iconWatercolor.png';
import iconFriendlist from '../assets/iconFriendlist.png';
import iconCollapse from '../assets/iconCollapse.png';
import iconExpand from '../assets/iconExpand.png';
import iconWorld from '../assets/iconWorld.png';
import iconSync from '../assets/iconSync.png';
import iconLogout from '../assets/iconLogout.png';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white90,
  },
  mapType: {
    position: 'absolute',
    top: 30,
    right: 5,
  },
  menuContainer: {
    flex: 1,
    marginTop: 60,
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
    tintColor: Colors.black,
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
      userId, getUser, tilesToSave, saveTiles, navigation,
    } = this.props;
    navigation.closeDrawer();
    if (tilesToSave.length > 0) {
      saveTiles(userId, tilesToSave);
    }
    setTimeout(() => {
      getUser(userId);
    }, 3000);
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
    const { mapType, tilesToSave } = this.props;
    const { showFriendlist, showCountries } = this.state;

    let mapTypeIcon;
    switch (mapType) {
      case 'hybrid':
        mapTypeIcon = iconMap;
        break;
      case 'standard':
        mapTypeIcon = iconWatercolor;
        break;
      case 'watercolor':
        mapTypeIcon = iconSatellite;
        break;
      default:
        mapTypeIcon = iconMap;
        break;
    }

    const testFriends = [
      {
        id: '5ae9c419728f801904a9624e', username: '0llum', tiles: 10000, level: 21,
      },
      {
        id: '5aeae9800a576c69ca1e023b', username: 'Liz', tiles: 36, level: 3,
      },
      {
        id: '5b675aa93d4ee00f1f4e2adf', username: 'Ute', tiles: 4321, level: 16,
      },
    ];

    const testCountries = [
      { id: 0, name: 'Germany' },
      { id: 1, name: 'Croatia' },
      { id: 2, name: 'Czech Republic' },
    ];

    return (
      <SafeAreaView style={styles.container} forceInset={{ top: 'always', horizontal: 'never' }}>
        <TouchableOpacity style={styles.mapType} onPress={() => this.toggleMapType()}>
          <Image style={styles.menuIcon} source={mapTypeIcon} />
        </TouchableOpacity>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleFriendlist()}>
            <Image style={styles.menuIcon} source={iconFriendlist} />
            <Text style={styles.menuLabel}>Friendlist</Text>
            <Image style={styles.menuIcon} source={showFriendlist ? iconCollapse : iconExpand} />
          </TouchableOpacity>
          <Collapsible collapsed={!showFriendlist} collapsedHeight={0}>
            <FlatList
              data={testFriends}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.menuItem} onPress={() => this.showFriend(item.id)}>
                  <Text style={styles.menuLabel}>{item.username}</Text>
                  <Text style={styles.menuBadge}>{item.level}</Text>
                </TouchableOpacity>
              )}
            />
          </Collapsible>
          <TouchableOpacity style={styles.menuItem} onPress={() => this.toggleCountries()}>
            <Image style={styles.menuIcon} source={iconWorld} />
            <Text style={styles.menuLabel}>Countries</Text>
            <Image style={styles.menuIcon} source={showCountries ? iconCollapse : iconExpand} />
          </TouchableOpacity>
          <Collapsible collapsed={!showCountries} collapsedHeight={0}>
            <FlatList
              data={testCountries}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuLabel}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </Collapsible>
          <TouchableOpacity style={styles.menuItem} onPress={() => this.syncData()}>
            <Image style={styles.menuIcon} source={iconSync} />
            <Text style={styles.menuLabel}>Sync Data</Text>
            <Text style={styles.menuBadge}>{tilesToSave.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => this.logout()}>
            <Image style={styles.menuIcon} source={iconLogout} />
            <Text style={styles.menuLabel}>Logout</Text>
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
});

const mapDispatchToProps = {
  getUser: userActions.getUser,
  getFriend: userActions.getFriend,
  logout: userActions.logout,
  setMapType: userActions.setMapType,
  saveTiles: userActions.saveTiles,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DrawerMenu);
