import React from 'react';
import {
  AsyncStorage, View, StyleSheet, Text,
} from 'react-native';
import { connect } from 'react-redux';
import { Permissions, Notifications } from 'expo';

import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
import * as Colors from '../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.creme,
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
    this.registerForPushAsync();
    this.getUserAsync();
  }

  registerForPushAsync = async () => {
    const { setPushToken } = this.props;
    await Permissions.askAsync(Permissions.NOTIFICATIONS);
    const token = await Notifications.getExpoPushTokenAsync();
    setPushToken(token);
  };

  getUserAsync = async () => {
    const {
      relogUser,
      setMapType,
      setTilesToSave,
      setLastTile,
      setTheme,
      setPowerSaver,
      navigation,
    } = this.props;

    const id = await AsyncStorage.getItem('id');
    const tilesToSave = await AsyncStorage.getItem('tilesToSave');
    const lastTile = await AsyncStorage.getItem('lastTile');
    const mapType = await AsyncStorage.getItem('mapType');
    const theme = await AsyncStorage.getItem('theme');
    const powerSaver = await AsyncStorage.getItem('powerSaver');

    setTimeout(() => {
      if (id) {
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
        if (powerSaver) {
          setPowerSaver(powerSaver);
        }
        relogUser(id);
      } else {
        navigation.navigate('Login');
      }
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

const mapDispatchToProps = {
  relogUser: userActions.relogUser,
  setTilesToSave: userActions.setTilesToSave,
  setLastTile: mapActions.setLastTile,
  setPushToken: userActions.setPushToken,
  setPowerSaver: mapActions.setPowerSaver,
  setMapType: mapActions.setMapType,
  setTheme: mapActions.setTheme,
};

export default connect(
  null,
  mapDispatchToProps,
)(SplashScreen);
