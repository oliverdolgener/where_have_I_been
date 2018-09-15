import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { middleware as reduxPackMiddleware } from 'redux-pack';
import { KeepAwake } from 'expo';
import UserReducer from './reducers/user';
import MapReducer from './reducers/map';
import AppNavigation from './navigation/AppNavigation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const store = createStore(
  combineReducers({
    user: UserReducer,
    map: MapReducer,
  }),
  applyMiddleware(reduxPackMiddleware),
);

export let navigator;

class App extends Component {
  componentDidMount() {
    navigator = this.navigator;
    KeepAwake.activate();
  }

  render() {
    return (
      <Provider store={store}>
        <View style={styles.container}>
          <AppNavigation
            ref={(nav) => {
              this.navigator = nav;
            }}
          />
        </View>
      </Provider>
    );
  }
}

console.disableYellowBox = true;

export default App;
