import { Map } from 'immutable';
import { handle } from 'redux-pack';
import { AsyncStorage } from 'react-native';

import NavigationService from '../navigation/NavigationService';
import GeoLocation from '../model/GeoLocation';
import GeoArray from '../model/GeoArray';
import * as SQLiteUtils from '../utils/SQLiteUtils';
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

export const types = {
  LOGIN: 'USER/LOGIN',
  LOGOUT: 'USER/LOGOUT',
  SIGNUP: 'USER/SIGNUP',
  GET_USER: 'USER/GET_USER',
  RELOG_USER: 'USER/RELOG_USER',
  RELOG_FROM_SQLITE: 'USER/RELOG_FROM_SQLITE',
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

export const actions = {
  login: (email, password, pushToken) => ({
    type: types.LOGIN,
    promise: login(email, password, pushToken),
    meta: {
      onSuccess: (result) => {
        setUserAsync(result.data.id);
        NavigationService.navigate('Map');
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
        NavigationService.navigate('Map');
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
        NavigationService.navigate('Map');
      },
      onFailure: () => {
        NavigationService.navigate('Login');
      },
    },
  }),
  relogFromSQLite: (userId, locations) => ({ type: types.RELOG_FROM_SQLITE, userId, locations }),
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
          SQLiteUtils.insertLocations(payload.data.locations);
          const visitedLocations = GeoArray.toGrid(payload.data.locations);
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
      SQLiteUtils.deleteLocations();
      removeUserAsync();
      NavigationService.navigate('Login');
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
          const visitedLocations = GeoArray.toGrid(payload.data.locations);
          return prevState
            .set('isLoggedIn', true)
            .set('userId', payload.data.id)
            .set('visitedLocations', visitedLocations);
        },
      });
    case types.RELOG_USER:
      return handle(state, action, {
        success: (prevState) => {
          SQLiteUtils.insertLocations(payload.data.locations);
          const visitedLocations = GeoArray.toGrid(payload.data.locations);
          return prevState
            .set('isLoggedIn', true)
            .set('userId', payload.data.id)
            .set('visitedLocations', visitedLocations);
        },
      });
    case types.RELOG_FROM_SQLITE: {
      const visitedLocations = GeoArray.toGrid(action.locations);
      setUserAsync(action.userId);
      setTimeout(() => NavigationService.navigate('Map'), 1000);
      return state
        .set('isLoggedIn', true)
        .set('userId', action.userId)
        .set('visitedLocations', visitedLocations);
    }
    case types.SET_EMAIL_ERROR:
      return state.set('emailError', action.error);
    case types.SET_PASSWORD_ERROR:
      return state.set('passwordError', action.error);
    case types.SET_LOCATIONS: {
      const visitedLocations = GeoArray.toGrid(action.locations);
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
          SQLiteUtils.insertLocations(savedLocations);
          const tilesToSave = state.get('tilesToSave');
          const difference = tilesToSave.filter(
            x => !savedLocations.find(y => GeoLocation.isEqual(y, x)),
          );
          setTilesToSaveAsync(difference);
          return prevState.set('tilesToSave', difference);
        },
        finish: prevState => prevState.set('isSaving', false),
      });
    case types.REMOVE_TILE:
      return handle(state, action, {
        success: (prevState) => {
          SQLiteUtils.deleteLocation(action.payload.data);
          return prevState;
        },
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
