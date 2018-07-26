import React from 'react';
import { AsyncStorage, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { actions as mapActions } from '../reducers/map';
import * as Colors from '../constants/Colors';
import iconMap from '../assets/iconMap.png';
import iconSatellite from '../assets/iconSatellite.png';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white90,
  },
  item: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  label: {
    fontSize: 20,
  },
  mapView: {
    position: 'absolute',
    top: 30,
    right: 10,
  },
  mapViewIcon: {
    width: 40,
    height: 40,
    tintColor: Colors.black,
  },
});

class DrawerMenu extends React.Component {
  toggleMapView = () => {
    this.props.navigation.closeDrawer();
    this.props.setMapView(this.props.mapView === 'standard' ? 'satellite' : 'standard');
  };

  logout = async () => {
    this.props.navigation.closeDrawer();
    await AsyncStorage.removeItem('id');
    this.props.navigation.navigate('Login');
  };

  render() {
    return (
      <SafeAreaView style={styles.container} forceInset={{ top: 'always', horizontal: 'never' }}>
        <TouchableOpacity style={styles.mapView} onPress={() => this.toggleMapView()}>
          <Image style={styles.mapViewIcon} source={this.props.mapView === 'standard' ? iconSatellite : iconMap} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => this.logout()}>
          <Text style={styles.label}>Logout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  mapView: state.map.get('mapView'),
});

const mapDispatchToProps = {
  setMapView: mapActions.setMapView,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DrawerMenu);
