import React from 'react';
import { AsyncStorage, View, StyleSheet, Text } from 'react-native';
import { connect } from 'react-redux';

import { actions as userActions } from '../reducers/user';
import * as Colors from '../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 96,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 24,
  },
});

class SplashScreen extends React.Component {
  componentWillMount() {
    this.getUserAsync();
  }

  getUserAsync = async () => {
    const {
      relogUser, getUser, setMapType, setTilesToSave, setLastTile, setTheme, navigation, setLocations,
    } = this.props;
    const id = await AsyncStorage.getItem('id');
    const locations = await AsyncStorage.getItem('locations');
    const tilesToSave = await AsyncStorage.getItem('tilesToSave');
    const lastTile = await AsyncStorage.getItem('lastTile');
    const mapType = await AsyncStorage.getItem('mapType');
    const theme = await AsyncStorage.getItem('theme');

    if (!id) {
      navigation.navigate('Login');
      return;
    }

    if (locations) {
      setLocations(JSON.parse(locations));
    }

    if (tilesToSave) {
      setTilesToSave(JSON.parse(tilesToSave));
    }
    if (lastTile) {
      setLastTile(JSON.parse(lastTile));
    }
    if (mapType) {
      setMapType(mapType);
    }
    if (theme) {
      setTheme(theme);
    }

    relogUser();
    getUser(id);

    setTimeout(() => {
      navigation.navigate('Map');
    }, 3000);
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>WHIB</Text>
        <Text style={styles.subtitle}>Where Have I Been</Text>
      </View>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {
  relogUser: userActions.relogUser,
  getUser: userActions.getUser,
  setMapType: userActions.setMapType,
  setTilesToSave: userActions.setTilesToSave,
  setLastTile: userActions.setLastTile,
  setTheme: userActions.setTheme,
  setLocations: userActions.setLocations,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SplashScreen);
