import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { KeepAwake, DangerZone, Brightness } from 'expo';
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

class App extends Component {
  componentDidMount() {
    KeepAwake.activate();
    DangerZone.DeviceMotion.setUpdateInterval(1000);
    this.motionListener = DangerZone.DeviceMotion.addListener(result =>
      this.handleMotionEvent(result));
  }

  componentWillUnmount() {
    this.motionListener.remove();
  }

  handleMotionEvent(result) {
    if (result.rotation && result.rotation.beta < -0.75) {
      Brightness.setBrightnessAsync(0);
    } else if (result.rotation && result.rotation.beta > 0.75) {
      this.resetBrightnessAsync();
    }
  }

  resetBrightnessAsync = async () => {
    const systemBrightness = await Brightness.getSystemBrightnessAsync();
    Brightness.setBrightnessAsync(systemBrightness);
  };

  render() {
    return (
      <Provider store={store}>
        <View style={styles.container}>
          <AppNavigation />
        </View>
      </Provider>
    );
  }
}

console.disableYellowBox = true;

export default App;
