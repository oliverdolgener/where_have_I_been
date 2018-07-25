import React from 'react';
import { createStore, combineReducers } from 'redux';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import MapReducer from './reducers/map';
// import ReduxNavigation from './navigation/ReduxNavigation';
import AppNavigation from './navigation/AppNavigation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const store = createStore(combineReducers({
  map: MapReducer,
}));

const App = () => (
  <Provider store={store}>
    <View style={styles.container}>
      <AppNavigation />
    </View>
  </Provider>
);

export default App;
