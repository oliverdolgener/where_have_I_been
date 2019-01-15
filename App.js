import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { middleware as reduxPackMiddleware } from 'redux-pack';
import { Font } from 'expo';

import Navigator from './navigation/Navigator';
import AppReducer from './reducers/app';
import UserReducer from './reducers/user';
import FriendReducer from './reducers/friend';
import MapReducer from './reducers/map';
import CountryReducer from './reducers/country';
import FlightReducer from './reducers/flight';
import OpenSansRegular from './assets/fonts/OpenSans-Regular.ttf';
import OpenSansLight from './assets/fonts/OpenSans-Light.ttf';

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
      regular: OpenSansRegular,
      light: OpenSansLight,
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
