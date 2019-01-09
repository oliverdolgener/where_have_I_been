import React, { Component } from 'react';
import {
  StyleSheet, Platform, StatusBar, View,
} from 'react-native';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { middleware as reduxPackMiddleware } from 'redux-pack';
import { Permissions, KeepAwake, Constants } from 'expo';
import UserReducer from './reducers/user';
import FriendReducer from './reducers/friend';
import MapReducer from './reducers/map';
import NavigationService from './navigation/NavigationService';
import AppNavigation from './navigation/AppNavigation';
import * as Colors from './constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: Constants.statusBarHeight,
    backgroundColor: Colors.creme,
  },
});

const store = createStore(
  combineReducers({
    user: UserReducer,
    friend: FriendReducer,
    map: MapReducer,
  }),
  applyMiddleware(reduxPackMiddleware),
);

class App extends Component {
  componentDidMount() {
    KeepAwake.activate();
    this.askPermissionsAsync();
  }

  askPermissionsAsync = async () => {
    await Permissions.askAsync(Permissions.LOCATION);
    await Permissions.askAsync(Permissions.NOTIFICATIONS);
  };

  render() {
    return (
      <Provider store={store}>
        <View style={styles.container}>
          {Platform.OS === 'ios' && (
            <View style={styles.statusBar}>
              <StatusBar backgroundColor="transparent" barStyle="dark-content" />
            </View>
          )}
          <AppNavigation
            ref={(navigatorRef) => {
              NavigationService.setTopLevelNavigator(navigatorRef);
            }}
          />
        </View>
      </Provider>
    );
  }
}

console.disableYellowBox = true;

export default App;
