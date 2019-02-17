import React from 'react';
import { AsyncStorage, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
import StyledText from '../components/StyledText';
import * as SQLiteUtils from '../utils/SQLiteUtils';
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
    SQLiteUtils.createDB();
    this.getUserAsync();
  }

  getUserAsync = async () => {
    const {
      relogUser,
      relogFromSQLite,
      setMapType,
      setTilesToSave,
      setLastTile,
      setTheme,
      setShape,
      navigation,
      setBackgroundTracking,
    } = this.props;

    const id = await AsyncStorage.getItem('id');
    const username = await AsyncStorage.getItem('username');
    const tilesToSave = await AsyncStorage.getItem('tilesToSave');
    const lastTile = await AsyncStorage.getItem('lastTile');
    const mapType = await AsyncStorage.getItem('mapType');
    const theme = await AsyncStorage.getItem('theme');
    const shape = await AsyncStorage.getItem('shape');
    const backgroundTracking = await AsyncStorage.getItem('backgroundTracking');

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
      if (shape) {
        setShape(shape);
      }
      if (backgroundTracking) {
        setBackgroundTracking(backgroundTracking);
      }

      SQLiteUtils.getLocations()
        .then((locations) => {
          if (locations && locations.length > 0) {
            console.log('sqlite');
            relogFromSQLite(id, username, locations);
          } else {
            console.log('server');
            relogUser(id, username);
          }
        })
        .catch(() => {
          relogUser(id, username);
        });
    } else {
      navigation.navigate('Login');
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <StyledText style={styles.title}>WHIB</StyledText>
        <StyledText style={styles.subtitle}>Where Have I Been</StyledText>
      </View>
    );
  }
}

const mapDispatchToProps = {
  relogUser: userActions.relogUser,
  relogFromSQLite: userActions.relogFromSQLite,
  setTilesToSave: userActions.setTilesToSave,
  setLastTile: mapActions.setLastTile,
  setMapType: mapActions.setMapType,
  setTheme: mapActions.setTheme,
  setShape: mapActions.setShape,
  setBackgroundTracking: mapActions.setBackgroundTracking,
};

export default connect(null, mapDispatchToProps)(SplashScreen);
