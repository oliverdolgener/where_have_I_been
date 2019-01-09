import React from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { middleware as reduxPackMiddleware } from 'redux-pack';

import Navigator from './navigation/Navigator';
import AppReducer from './reducers/app';
import UserReducer from './reducers/user';
import FriendReducer from './reducers/friend';
import MapReducer from './reducers/map';

const store = createStore(
  combineReducers({
    app: AppReducer,
    user: UserReducer,
    friend: FriendReducer,
    map: MapReducer,
  }),
  applyMiddleware(reduxPackMiddleware),
);

const App = () => (
  <Provider store={store}>
    <Navigator />
  </Provider>
);

export default App;
