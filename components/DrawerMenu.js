import React from 'react';
import { StyleSheet, Animated, ScrollView, View, TouchableOpacity, FlatList, Switch } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import Collapsible from 'react-native-collapsible';

import { actions as userActions } from '../reducers/user';
import ThemedText from '../components/ThemedText';
import ThemedIcon from '../components/ThemedIcon';
import ThemedTextInput from '../components/ThemedTextInput';
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
import iconPowerSaver from '../assets/iconPowerSaver.png';
import iconAdd from '../assets/iconAdd.png';

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
      isSpinning: false,
      spinValue: new Animated.Value(0),
      friendName: '',
    };
  }

  componentDidMount() {
    const { userId, getFriends } = this.props;
    getFriends(userId);
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
    addFriend(userId, friendName);
  }

  onChangeFriendName(friendName) {
    this.setState({
      friendName,
    });
  }

  spin() {
    this.setState({ isSpinning: true });
    this.state.spinValue.setValue(0);
    Animated.timing(this.state.spinValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      if (this.props.isSaving) {
        this.spin();
      } else {
        this.setState({ isSpinning: false });
      }
    });
  }

  toggleTheme = () => {
    const { theme, setTheme, navigation } = this.props;
    navigation.closeDrawer();
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  togglePowerSaver = () => {
    const { powerSaver, setPowerSaver, navigation } = this.props;
    navigation.closeDrawer();
    setPowerSaver(powerSaver === 'on' ? 'off' : 'on');
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
      userId, tilesToSave, saveTiles, isSaving,
    } = this.props;
    if (!isSaving && tilesToSave.length > 0) {
      saveTiles(userId, tilesToSave);
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
    const {
      friends, mapType, tilesToSave, theme, powerSaver,
    } = this.props;
    const { showFriendlist, showCountries, spinValue } = this.state;

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
      case 'watercolor':
        mapTypeIcon = iconWatercolor;
        break;
      default:
        mapTypeIcon = iconSatellite;
        break;
    }

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
            <Collapsible collapsed={!showFriendlist} collapsedHeight={0}>
              <FlatList
                data={friends}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.menuItem} onPress={() => this.showFriend(item.id)}>
                    <ThemedText style={styles.menuLabel}>{item.username}</ThemedText>
                    <ThemedText style={styles.menuBadge}>{item.level}</ThemedText>
                  </TouchableOpacity>
                )}
                ListHeaderComponent={
                  <View style={styles.menuItem} >
                    <ThemedTextInput
                      style={styles.menuLabel}
                      placeholder="Add Friend"
                      onChangeText={text => this.onChangeFriendName(text)}
                      value={this.state.friendName}
                      onSubmitEditing={() => this.onAddFriend()}
                    />
                    <ThemedIcon style={styles.menuIcon} source={iconAdd} />
                  </View>
                }
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
});

const mapDispatchToProps = {
  getFriends: userActions.getFriends,
  addFriend: userActions.addFriend,
  getFriend: userActions.getFriend,
  logout: userActions.logout,
  setMapType: userActions.setMapType,
  saveTiles: userActions.saveTiles,
  setTheme: userActions.setTheme,
  setPowerSaver: userActions.setPowerSaver,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DrawerMenu);
