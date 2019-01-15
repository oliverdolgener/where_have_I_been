import React from 'react';
import { AsyncStorage, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { Permissions, Notifications } from 'expo';

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
      setUserPushToken,
      relogUser,
      relogFromSQLite,
      setMapType,
      setTilesToSave,
      setLastTile,
      setTheme,
      setShape,
      navigation,
    } = this.props;

    const id = await AsyncStorage.getItem('id');
    const tilesToSave = await AsyncStorage.getItem('tilesToSave');
    const lastTile = await AsyncStorage.getItem('lastTile');
    const mapType = await AsyncStorage.getItem('mapType');
    const theme = await AsyncStorage.getItem('theme');
    const shape = await AsyncStorage.getItem('shape');

    if (id) {
      const { pushToken } = this.props;
      pushToken && setUserPushToken(id, pushToken);
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

      let visitedLocations = [];
      SQLiteUtils.getLocations().then((locations) => {
        visitedLocations = locations;
      });

      setTimeout(() => {
        if (visitedLocations.length > 0) {
          relogFromSQLite(id, visitedLocations);
        } else {
          relogUser(id);
        }
      }, 3000);
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

const mapStateToProps = state => ({
  pushToken: state.user.get('pushToken'),
});

const mapDispatchToProps = {
  relogUser: userActions.relogUser,
  relogFromSQLite: userActions.relogFromSQLite,
  setTilesToSave: userActions.setTilesToSave,
  setLastTile: mapActions.setLastTile,
  setPushToken: userActions.setPushToken,
  setUserPushToken: userActions.setUserPushToken,
  setMapType: mapActions.setMapType,
  setTheme: mapActions.setTheme,
  setShape: mapActions.setShape,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SplashScreen);
