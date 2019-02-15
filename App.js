import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { middleware as reduxPackMiddleware } from 'redux-pack';
import { Font } from 'expo';

import Navigator from './app/navigation/Navigator';
import AppReducer from './app/reducers/app';
import UserReducer from './app/reducers/user';
import FriendReducer from './app/reducers/friend';
import MapReducer from './app/reducers/map';
import CountryReducer from './app/reducers/country';
import FlightReducer from './app/reducers/flight';
import Regular from './app/assets/fonts/Lato-Regular.ttf';
import Light from './app/assets/fonts/Lato-Light.ttf';

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
