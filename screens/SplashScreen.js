import React from 'react';
import {
  AsyncStorage, View, StyleSheet, Text,
} from 'react-native';
import { connect } from 'react-redux';
import { Permissions, Notifications, SQLite } from 'expo';

import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
import * as Colors from '../constants/Colors';

const db = SQLite.openDatabase('db.db');

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

  componentDidMount() {
    db.transaction((tx) => {
      tx.executeSql(
        'create table if not exists location (id integer primary key not null, latitude int not null, longitude int not null, timestamp int);',
      );
      // tx.executeSql('delete from location', []);
    });
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
        if (powerSaver) {
          setPowerSaver(powerSaver);
        }
        db.transaction(
          (tx) => {
            tx.executeSql(
              'select * from location where user_id = ?',
              [id],
              (_, { rows: { _array } }) => {
                console.log(_array);
                if (_array.length > 0) {
                  relogFromSQLite(id, _array);
                } else {
                  console.log('relogFromServer');
                  relogUser(id);
                }
              },
            );
          },
          null,
          null,
        );
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
  setPowerSaver: mapActions.setPowerSaver,
  setMapType: mapActions.setMapType,
  setTheme: mapActions.setTheme,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SplashScreen);
