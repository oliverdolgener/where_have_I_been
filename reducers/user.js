import { Map } from 'immutable';
import { handle } from 'redux-pack';
import { NavigationActions } from 'react-navigation';
import { AsyncStorage } from 'react-native';

import Coordinate from '../model/Coordinate';
import * as MathUtils from '../utils/MathUtils';
import * as EarthUtils from '../utils/EarthUtils';
import { getUser, login, signup, saveTiles } from '../services/api';
import { navigator } from '../App';

export const types = {
  LOGIN: 'USER/LOGIN',
  LOGOUT: 'USER/LOGOUT',
  SIGNUP: 'USER/SIGNUP',
  GET_USER: 'USER/GET_USER',
  GET_FRIEND: 'USER/GET_FRIEND',
  RESET_FRIEND: 'USER/RESET_FRIEND',
  RELOG_USER: 'USER/RELOG_USER',
  SET_EMAIL_ERROR: 'USER/SET_EMAIL_ERROR',
  SET_PASSWORD_ERROR: 'USER/SET_PASSWORD_ERROR',
  SET_LOCATIONS: 'USER/SET_LOCATIONS',
  SET_REGION: 'USER/SET_REGION',
  SET_MAPTYPE: 'USER/SET_MAPTYPE',
  SET_TILES_TO_SAVE: 'USER/SET_TILES_TO_SAVE',
  SAVE_TILES: 'USER/SAVE_TILES',
  SET_THEME: 'USER/SET_THEME',
  SET_LAST_TILE: 'USER/SET_LAST_TILE',
};

const setUserAsync = async (id) => {
  await AsyncStorage.setItem('id', id);
};

const removeUserAsync = async () => {
  await AsyncStorage.removeItem('id');
};

const setTilesToSaveAsync = async (tilesToSave) => {
  await AsyncStorage.setItem('tilesToSave', JSON.stringify(tilesToSave));
};

const setLastTileAsync = async (tile) => {
  await AsyncStorage.setItem('lastTile', JSON.stringify(tile));
};

const setMapTypeAsync = async (mapType) => {
  await AsyncStorage.setItem('mapType', mapType);
};

const setThemeAsync = async (theme) => {
  await AsyncStorage.setItem('theme', theme);
};

const prepareLocations = (locations) => {
  const visitedLocations = locations.map(x => new Coordinate(x.latitude, x.longitude, x.timestamp));
  return MathUtils.removeDuplicateLocations(visitedLocations);
};

const prepareHoles = (locations, region) => {
  const visibleLocations = locations.filter(x => x.isInRegion(region, 2));
  const gridDistance = EarthUtils.getGridDistanceByRegion(region);
  return EarthUtils.getSliceCoordinates(visibleLocations, gridDistance);
};

export const actions = {
  login: (email, password) => ({
    type: types.LOGIN,
    promise: login(email, password),
    meta: {
      onSuccess: (result) => {
        setUserAsync(result.data._id);
        navigator.dispatch(NavigationActions.navigate({ routeName: 'Map' }));
      },
    },
  }),
  logout: () => ({ type: types.LOGOUT }),
  signup: (email, password) => ({
    type: types.SIGNUP,
    promise: signup(email, password),
    meta: {
      onSuccess: (result) => {
        setUserAsync(result.data._id);
        navigator.dispatch(NavigationActions.navigate({ routeName: 'Map' }));
      },
    },
  }),
  getUser: userId => ({
    type: types.GET_USER,
    promise: getUser(userId),
  }),
  getFriend: friendId => ({
    type: types.GET_FRIEND,
    promise: getUser(friendId),
  }),
  resetFriend: () => ({ type: types.RESET_FRIEND }),
  relogUser: userId => ({
    type: types.RELOG_USER,
    promise: getUser(userId),
    meta: {
      onSuccess: (result) => {
        setUserAsync(result.data._id);
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
  setRegion: region => ({ type: types.SET_REGION, region }),
  setMapType: mapType => ({ type: types.SET_MAPTYPE, mapType }),
  setTilesToSave: tilesToSave => ({ type: types.SET_TILES_TO_SAVE, tilesToSave }),
  saveTiles: (userId, tilesToSave) => ({
    type: types.SAVE_TILES,
    promise: saveTiles(userId, tilesToSave),
  }),
  setTheme: theme => ({ type: types.SET_THEME, theme }),
  setLastTile: lastTile => ({ type: types.SET_LAST_TILE, lastTile }),
};

const initialState = Map({
  isLoggedIn: false,
  userId: false,
  friendId: false,
  region: {
    latitude: 52.558,
    longitude: 13.206504,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  },
  visitedLocations: [],
  friendLocations: [],
  holes: [],
  emailError: '',
  passwordError: '',
  mapType: 'hybrid',
  tilesToSave: [],
  theme: 'light',
  lastTile: new Coordinate(52.558, 13.206504),
  isSaving: false,
});

export default (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case types.LOGIN:
      return handle(state, action, {
        success: (prevState) => {
          const visitedLocations = prepareLocations(payload.data.locations);
          const holes = prepareHoles(visitedLocations, state.get('region'));
          return prevState
            .set('isLoggedIn', true)
            .set('userId', payload.data._id)
            .set('visitedLocations', visitedLocations)
            .set('holes', holes)
            .set('emailError', '')
            .set('passwordError', '');
        },
        failure: prevState =>
          prevState.set('emailError', '').set('passwordError', 'Wrong Email or Password'),
      });
    case types.LOGOUT:
      removeUserAsync();
      navigator.dispatch(NavigationActions.navigate({ routeName: 'Login' }));
      return state
        .set('isLoggedIn', false)
        .set('userId', false)
        .set('friendId', false)
        .set('visitedLocations', [])
        .set('holes', []);
    case types.SIGNUP:
      return handle(state, action, {
        success: prevState =>
          prevState
            .set('isLoggedIn', true)
            .set('userId', payload.data._id)
            .set('visitedLocations', [])
            .set('holes', [])
            .set('emailError', '')
            .set('passwordError', ''),
        failure: prevState =>
          prevState
            .set('emailError', 'Email address already in use. Try to login instead.')
            .set('passwordError', ''),
      });
    case types.GET_USER:
      return handle(state, action, {
        success: (prevState) => {
          const visitedLocations = prepareLocations(payload.data.locations);
          const holes = prepareHoles(visitedLocations, state.get('region'));
          return prevState
            .set('isLoggedIn', true)
            .set('userId', payload.data._id)
            .set('visitedLocations', visitedLocations)
            .set('holes', holes);
        },
      });
    case types.GET_FRIEND:
      return handle(state, action, {
        success: (prevState) => {
          const friendLocations = prepareLocations(payload.data.locations);
          const holes = prepareHoles(friendLocations, state.get('region'));
          return prevState
            .set('friendId', payload.data._id)
            .set('friendLocations', friendLocations)
            .set('holes', holes);
        },
      });
    case types.RESET_FRIEND: {
      const visitedLocations = state.get('visitedLocations');
      const holes = prepareHoles(visitedLocations, state.get('region'));
      return state
        .set('friendId', false)
        .set('friendLocations', [])
        .set('holes', holes);
    }
    case types.RELOG_USER:
      return handle(state, action, {
        success: (prevState) => {
          const visitedLocations = prepareLocations(payload.data.locations);
          const holes = prepareHoles(visitedLocations, state.get('region'));
          return prevState
            .set('isLoggedIn', true)
            .set('userId', payload.data._id)
            .set('visitedLocations', visitedLocations)
            .set('holes', holes);
        },
      });
    case types.SET_EMAIL_ERROR:
      return state.set('emailError', action.error);
    case types.SET_PASSWORD_ERROR:
      return state.set('passwordError', action.error);
    case types.SET_LOCATIONS: {
      const visitedLocations = prepareLocations(action.locations);
      const locations = state.get('friendId') ? state.get('friendLocations') : visitedLocations;
      const holes = prepareHoles(locations, state.get('region'));
      return state.set('visitedLocations', visitedLocations).set('holes', holes);
    }
    case types.SET_REGION: {
      const locations = state.get('friendId')
        ? state.get('friendLocations')
        : state.get('visitedLocations');
      const holes = prepareHoles(locations, action.region);
      return state.set('region', action.region).set('holes', holes);
    }
    case types.SET_MAPTYPE:
      setMapTypeAsync(action.mapType);
      return state.set('mapType', action.mapType);
    case types.SET_TILES_TO_SAVE:
      setTilesToSaveAsync(action.tilesToSave);
      return state.set('tilesToSave', action.tilesToSave);
    case types.SAVE_TILES:
      return handle(state, action, {
        start: prevState => prevState.set('isSaving', true),
        success: (prevState) => {
          const savedLocations = action.payload.data.locations;
          const tilesToSave = state.get('tilesToSave');
          const difference = tilesToSave.filter(x => !savedLocations.find(y => Coordinate.isEqual(y, x)));
          setTilesToSaveAsync(difference);
          return prevState.set('tilesToSave', difference);
        },
        finish: prevState => prevState.set('isSaving', false),
      });
    case types.SET_THEME:
      setThemeAsync(action.theme);
      return state.set('theme', action.theme);
    case types.SET_LAST_TILE: {
      setLastTileAsync(action.lastTile);
      return state.set('lastTile', action.lastTile);
    }
    default:
      return state;
  }
};
