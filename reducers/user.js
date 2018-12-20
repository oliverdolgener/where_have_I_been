import { Map } from 'immutable';
import { handle } from 'redux-pack';
import { NavigationActions } from 'react-navigation';
import { AsyncStorage } from 'react-native';

import Coordinate from '../model/Coordinate';
import * as LocationUtils from '../utils/LocationUtils';
import {
  getLocations,
  login,
  signup,
  setUserPushToken,
  saveTiles,
  removeTile,
  getFlights,
  addFlight,
  removeFlight,
} from '../services/api';
import { navigator } from '../App';

export const types = {
  LOGIN: 'USER/LOGIN',
  LOGOUT: 'USER/LOGOUT',
  SIGNUP: 'USER/SIGNUP',
  GET_USER: 'USER/GET_USER',
  RELOG_USER: 'USER/RELOG_USER',
  SET_EMAIL_ERROR: 'USER/SET_EMAIL_ERROR',
  SET_PASSWORD_ERROR: 'USER/SET_PASSWORD_ERROR',
  SET_LOCATIONS: 'USER/SET_LOCATIONS',
  SET_TILES_TO_SAVE: 'USER/SET_TILES_TO_SAVE',
  SAVE_TILES: 'USER/SAVE_TILES',
  REMOVE_TILE: 'USER/REMOVE_TILE',
  SET_PUSH_TOKEN: 'USER/SET_PUSH_TOKEN',
  SET_USER_PUSH_TOKEN: 'USER/SET_USER_PUSH_TOKEN',
  GET_FLIGHTS: 'USER/GET_FLIGHTS',
  ADD_FLIGHT: 'USER/ADD_FLIGHT',
  REMOVE_FLIGHT: 'USER/REMOVE_FLIGHT',
};

const setUserAsync = async (id) => {
  await AsyncStorage.setItem('id', id.toString());
};

const removeUserAsync = async () => {
  await AsyncStorage.removeItem('id');
};

const setTilesToSaveAsync = async (tilesToSave) => {
  await AsyncStorage.setItem('tilesToSave', JSON.stringify(tilesToSave));
};

const prepareLocations = (locations) => {
  const grid = LocationUtils.arrayToGrid(locations);
  return grid;
};

export const actions = {
  login: (email, password, pushToken) => ({
    type: types.LOGIN,
    promise: login(email, password, pushToken),
    meta: {
      onSuccess: (result) => {
        setUserAsync(result.data.id);
        navigator.dispatch(NavigationActions.navigate({ routeName: 'Map' }));
      },
    },
  }),
  logout: () => ({ type: types.LOGOUT }),
  signup: (email, password, pushToken) => ({
    type: types.SIGNUP,
    promise: signup(email, password, pushToken),
    meta: {
      onSuccess: (result) => {
        setUserAsync(result.data.id);
        navigator.dispatch(NavigationActions.navigate({ routeName: 'Map' }));
      },
    },
  }),
  getUser: userId => ({
    type: types.GET_USER,
    promise: getLocations(userId),
  }),
  relogUser: userId => ({
    type: types.RELOG_USER,
    promise: getLocations(userId),
    meta: {
      onSuccess: () => {
        setUserAsync(userId);
        navigator.dispatch(NavigationActions.navigate({ routeName: 'Map' }));
      },
      onFailure: () => {
        navigator.dispatch(NavigationActions.navigate({ routeName: 'Login' }));
      },
    },
  }),
  setEmailError: error => ({ type: types.SET_EMAIL_ERROR, error }),
  setPasswordError: error => ({ type: types.SET_PASSWORD_ERROR, error }),
  setLocations: locations => ({ type: types.SET_LOCATIONS, locations }),
  setTilesToSave: tilesToSave => ({ type: types.SET_TILES_TO_SAVE, tilesToSave }),
  saveTiles: (userId, tilesToSave) => ({
    type: types.SAVE_TILES,
    promise: saveTiles(userId.toString(), tilesToSave),
  }),
  removeTile: (userId, tile) => ({
    type: types.REMOVE_TILE,
    promise: removeTile(userId.toString(), tile),
  }),
  setPushToken: pushToken => ({ type: types.SET_PUSH_TOKEN, pushToken }),
  setUserPushToken: (userId, pushToken) => ({
    type: types.SET_USER_PUSH_TOKEN,
    promise: setUserPushToken(userId, pushToken),
  }),
  getFlights: userId => ({
    type: types.GET_FLIGHTS,
    promise: getFlights(userId),
  }),
  addFlight: (userId, from, to) => ({
    type: types.ADD_FLIGHT,
    promise: addFlight(userId, from, to),
  }),
  removeFlight: (userId, from, to) => ({
    type: types.REMOVE_FLIGHT,
    promise: removeFlight(userId, from, to),
  }),
};

const initialState = Map({
  isLoggedIn: false,
  userId: false,
  visitedLocations: [],
  flights: [],
  emailError: '',
  passwordError: '',
  tilesToSave: [],
  isSaving: false,
  isLoggingIn: false,
  pushToken: false,
});

export default (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case types.LOGIN:
      return handle(state, action, {
        start: prevState => prevState.set('isLoggingIn', true),
        success: (prevState) => {
          const visitedLocations = prepareLocations(payload.data.locations);
          return prevState
            .set('isLoggedIn', true)
            .set('userId', payload.data.id)
            .set('visitedLocations', visitedLocations)
            .set('emailError', '')
            .set('passwordError', '');
        },
        failure: prevState => prevState.set('emailError', '').set('passwordError', 'Wrong Email or Password'),
        finish: prevState => prevState.set('isLoggingIn', false),
      });
    case types.LOGOUT:
      removeUserAsync();
      navigator.dispatch(NavigationActions.navigate({ routeName: 'Login' }));
      return state
        .set('isLoggedIn', false)
        .set('userId', false)
        .set('visitedLocations', [])
        .set('flights', []);
    case types.SIGNUP:
      return handle(state, action, {
        success: prevState => prevState
          .set('isLoggedIn', true)
          .set('userId', payload.data.id)
          .set('visitedLocations', [])
          .set('emailError', '')
          .set('passwordError', ''),
        failure: prevState => prevState
          .set('emailError', 'Email address already in use. Try to login instead.')
          .set('passwordError', ''),
      });
    case types.GET_USER:
      return handle(state, action, {
        success: (prevState) => {
          const visitedLocations = prepareLocations(payload.data.locations);
          return prevState
            .set('isLoggedIn', true)
            .set('userId', payload.data.id)
            .set('visitedLocations', visitedLocations);
        },
      });
    case types.RELOG_USER:
      return handle(state, action, {
        success: (prevState) => {
          const visitedLocations = prepareLocations(payload.data.locations);
          return prevState
            .set('isLoggedIn', true)
            .set('userId', payload.data.id)
            .set('visitedLocations', visitedLocations);
        },
      });
    case types.SET_EMAIL_ERROR:
      return state.set('emailError', action.error);
    case types.SET_PASSWORD_ERROR:
      return state.set('passwordError', action.error);
    case types.SET_LOCATIONS: {
      const visitedLocations = prepareLocations(action.locations);
      return state.set('visitedLocations', visitedLocations);
    }
    case types.SET_TILES_TO_SAVE:
      setTilesToSaveAsync(action.tilesToSave);
      return state.set('tilesToSave', action.tilesToSave);
    case types.SAVE_TILES:
      return handle(state, action, {
        start: prevState => prevState.set('isSaving', true),
        success: (prevState) => {
          const savedLocations = action.payload.data;
          const tilesToSave = state.get('tilesToSave');
          const difference = tilesToSave.filter(
            x => !savedLocations.find(y => Coordinate.isEqual(y, x)),
          );
          setTilesToSaveAsync(difference);
          return prevState.set('tilesToSave', difference);
        },
        finish: prevState => prevState.set('isSaving', false),
      });
    case types.SET_PUSH_TOKEN: {
      return state.set('pushToken', action.pushToken);
    }
    case types.GET_FLIGHTS: {
      return handle(state, action, {
        success: prevState => prevState.set('flights', payload.data),
      });
    }
    case types.ADD_FLIGHT: {
      return handle(state, action, {
        success: prevState => prevState.set('flights', payload.data),
      });
    }
    case types.REMOVE_FLIGHT: {
      return handle(state, action, {
        success: prevState => prevState.set('flights', payload.data),
      });
    }
    default:
      return state;
  }
};
