import React from 'react';
import { AsyncStorage, StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
import * as Colors from '../constants/Colors';
import iconMap from '../assets/iconMap.png';
import iconSatellite from '../assets/iconSatellite.png';
import iconWatercolor from '../assets/iconWatercolor.png';
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
  },
});

class DrawerMenu extends React.Component {
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

  logout = async () => {
    this.props.navigation.closeDrawer();
    await AsyncStorage.removeItem('id');
    this.props.logout();
    this.props.navigation.navigate('Login');
  };

  render() {
    const { mapType } = this.props;

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

    return (
      <SafeAreaView style={styles.container} forceInset={{ top: 'always', horizontal: 'never' }}>
        <TouchableOpacity style={styles.mapType} onPress={() => this.toggleMapType()}>
          <Image style={styles.menuIcon} source={mapTypeIcon} />
        </TouchableOpacity>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => this.syncData()}>
            <Image style={styles.menuIcon} source={iconSync} />
            <Text style={styles.menuLabel}>Sync Data</Text>
            <Text style={styles.menuBadge}>20</Text>
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
  mapType: state.map.get('mapType'),
});

const mapDispatchToProps = {
  logout: userActions.logout,
  setMapType: mapActions.setMapType,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DrawerMenu);
