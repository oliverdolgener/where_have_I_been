import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { middleware as reduxPackMiddleware } from 'redux-pack';
import { Font, TaskManager } from 'expo';

import Navigator from './navigation/Navigator';
import AppReducer from './reducers/app';
import UserReducer from './reducers/user';
import FriendReducer from './reducers/friend';
import MapReducer from './reducers/map';
import CountryReducer from './reducers/country';
import FlightReducer from './reducers/flight';
import GeoLocation from './model/GeoLocation';
import GeoArray from './model/GeoArray';
import Regular from './assets/fonts/Lato-Regular.ttf';
import Light from './assets/fonts/Lato-Light.ttf';

TaskManager.defineTask('location', ({ data, error }) => {
  if (error || !data) {
    return;
  }

  const { locations } = data;
  if (locations.length < 1) {
    return;
  }

  const result = locations[0];
  const { latitude, longitude, accuracy } = result.coords;
  const { timestamp } = result;

  const location = {
    latitude,
    longitude,
    timestamp,
  };

  if (accuracy < 100) {
    const roundedLocation = GeoLocation.getRoundedLocation(location);
    AsyncStorage.getItem('backgroundLocations').then((asyncLocations) => {
      if (asyncLocations) {
        const backgroundLocations = JSON.parse(asyncLocations);
        if (!GeoArray.contains(roundedLocation, backgroundLocations)) {
          backgroundLocations.push(roundedLocation);
          AsyncStorage.setItem('backgroundLocations', JSON.stringify(backgroundLocations));
        }
      } else {
        AsyncStorage.setItem('backgroundLocations', JSON.stringify([roundedLocation]));
      }
    });
  }
});

const store = createStore(
  combineReducers({
    app: AppReducer,
    user: UserReducer,
    friend: FriendReducer,
    map: MapReducer,
    country: CountryReducer,
    flight: FlightReducer,
  }),
  applyMiddleware(reduxPackMiddleware),
);

class App extends Component {
  constructor() {
    super();
    this.state = {
      fontsLoaded: false,
    };
  }

  async componentDidMount() {
    await Font.loadAsync({
      regular: Regular,
      light: Light,
    });
    this.setState({ fontsLoaded: true });
  }

  render() {
    const { fontsLoaded } = this.state;
    return (
      fontsLoaded && (
        <Provider store={store}>
          <Navigator />
        </Provider>
      )
    );
  }
}

export default App;
