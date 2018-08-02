import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { KeepAwake } from 'expo';
import UserReducer from './reducers/user';
import MapReducer from './reducers/map';
import AppNavigation from './navigation/AppNavigation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const store = createStore(combineReducers({
  user: UserReducer,
  map: MapReducer,
}));

const App = () => (
  <Provider store={store}>
    <View style={styles.container}>
      <KeepAwake />
      <AppNavigation />
    </View>
  </Provider>
);

console.disableYellowBox = true;

export default App;
