import React from 'react';
import { AsyncStorage, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
import * as Colors from '../constants/Colors';
import iconMap from '../assets/iconMap.png';
import iconSatellite from '../assets/iconSatellite.png';
import iconWatercolor from '../assets/iconWatercolor.png';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white90,
  },
  mapType: {
    position: 'absolute',
    top: 30,
    right: 10,
  },
  mapTypeIcon: {
    width: 40,
    height: 40,
    tintColor: Colors.black,
  },
  logout: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  label: {
    fontSize: 20,
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
          <Image style={styles.mapTypeIcon} source={mapTypeIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout} onPress={() => this.logout()}>
          <Text style={styles.label}>Logout</Text>
        </TouchableOpacity>
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
