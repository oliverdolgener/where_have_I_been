import { Map } from 'immutable';
import { handle } from 'redux-pack';
import { NavigationActions } from 'react-navigation';
import { AsyncStorage } from 'react-native';

import Coordinate from '../model/Coordinate';
import * as MathUtils from '../utils/MathUtils';
import * as EarthUtils from '../utils/EarthUtils';
import * as LevelUtils from '../utils/LevelUtils';
import {
  getUser,
  login,
  signup,
  saveTiles,
  getFriends,
  addFriend,
  removeFriend,
  getFlights,
  addFlight,
} from '../services/api';
import { navigator } from '../App';

export const types = {
  LOGIN: 'USER/LOGIN',
  LOGOUT: 'USER/LOGOUT',
  SIGNUP: 'USER/SIGNUP',
  GET_USER: 'USER/GET_USER',
  GET_FRIENDS: 'USER/GET_FRIENDS',
  ADD_FRIEND: 'USER/ADD_FRIEND',
  REMOVE_FRIEND: 'USER/REMOVE_FRIEND',
  GET_FRIEND: 'USER/GET_FRIEND',
  RESET_FRIEND: 'USER/RESET_FRIEND',
  RELOG_USER: 'USER/RELOG_USER',
  SET_EMAIL_ERROR: 'USER/SET_EMAIL_ERROR',
  SET_PASSWORD_ERROR: 'USER/SET_PASSWORD_ERROR',
  SET_LOCATIONS: 'USER/SET_LOCATIONS',
  SET_REGION: 'USER/SET_REGION',
  SET_TILES_TO_SAVE: 'USER/SET_TILES_TO_SAVE',
  SAVE_TILES: 'USER/SAVE_TILES',
  SET_PUSH_TOKEN: 'USER/SET_PUSH_TOKEN',
  GET_FLIGHTS: 'USER/GET_FLIGHTS',
  ADD_FLIGHT: 'USER/ADD/FLIGHT',
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
  const grid = MathUtils.arrayToGrid(locations);
  return grid;
};

const prepareHoles = (locations, region) => {
  const visibleLocations = MathUtils.filterVisibleLocations(locations, region);
  const gridDistance = EarthUtils.getGridDistanceByRegion(region);
  const slices = EarthUtils.getSliceCoordinates(visibleLocations, gridDistance);
  return slices;
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
    promise: getUser(userId),
  }),
  getFriends: userId => ({
    type: types.GET_FRIENDS,
    promise: getFriends(userId),
  }),
  addFriend: (userId, friendName) => ({
    type: types.ADD_FRIEND,
    promise: addFriend(userId, friendName),
  }),
  removeFriend: (userId, friendId) => ({
    type: types.REMOVE_FRIEND,
    promise: removeFriend(userId, friendId),
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
  setRegion: region => ({ type: types.SET_REGION, region }),
  setTilesToSave: tilesToSave => ({ type: types.SET_TILES_TO_SAVE, tilesToSave }),
  saveTiles: (userId, tilesToSave) => ({
    type: types.SAVE_TILES,
    promise: saveTiles(userId.toString(), tilesToSave),
  }),
  setPushToken: pushToken => ({ type: types.SET_PUSH_TOKEN, pushToken }),
  getFlights: userId => ({
    type: types.GET_FLIGHTS,
    promise: getFlights(userId),
  }),
  addFlight: (userId, from, to) => ({
    type: types.ADD_FLIGHT,
    promise: addFlight(userId, from, to),
  }),
};

const initialState = Map({
  isLoggedIn: false,
  userId: false,
  friendId: false,
  friends: [],
  region: {
    latitude: 52.558,
    longitude: 13.206497,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  },
  visitedLocations: [],
  friendLocations: [],
  holes: [],
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
          const holes = prepareHoles(visitedLocations, state.get('region'));
          return prevState
            .set('isLoggedIn', true)
            .set('userId', payload.data.id)
            .set('visitedLocations', visitedLocations)
            .set('holes', holes)
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
        .set('friendId', false)
        .set('visitedLocations', [])
        .set('holes', []);
    case types.SIGNUP:
      return handle(state, action, {
        success: prevState => prevState
          .set('isLoggedIn', true)
          .set('userId', payload.data.id)
          .set('visitedLocations', [])
          .set('holes', [])
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
          const holes = prepareHoles(visitedLocations, state.get('region'));
          return prevState
            .set('isLoggedIn', true)
            .set('userId', payload.data.id)
            .set('visitedLocations', visitedLocations)
            .set('holes', holes);
        },
      });
    case types.GET_FRIENDS:
      return handle(state, action, {
        success: (prevState) => {
          const friends = payload.data.map(x => ({
            id: x.id.toString(),
            username: x.username,
            level: LevelUtils.getLevelFromExp(x.locations),
          }));
          return prevState.set('friends', friends);
        },
      });
    case types.ADD_FRIEND:
      return handle(state, action, {
        failure: prevState => prevState.set('friendError', 'User not found'),
        success: (prevState) => {
          const friends = payload.data.map(x => ({
            id: x.id.toString(),
            username: x.username,
            level: LevelUtils.getLevelFromExp(x.locations),
          }));
          return prevState.set('friends', friends).set('friendError', '');
        },
      });
    case types.REMOVE_FRIEND:
      return handle(state, action, {
        success: (prevState) => {
          const friends = payload.data.map(x => ({
            id: x.id.toString(),
            username: x.username,
            level: LevelUtils.getLevelFromExp(x.locations),
          }));
          return prevState.set('friends', friends);
        },
      });
    case types.GET_FRIEND:
      return handle(state, action, {
        success: (prevState) => {
          const friendLocations = prepareLocations(payload.data.locations);
          const holes = prepareHoles(friendLocations, state.get('region'));
          return prevState
            .set('friendId', payload.data.id)
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
            .set('userId', payload.data.id)
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
      if (JSON.stringify(holes) === JSON.stringify(state.get('holes'))) {
        return state.set('region', action.region);
      }
      return state.set('region', action.region).set('holes', holes);
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
        success: prevState => prevState
          .set('flights', payload.data),
      });
    }
    case types.ADD_FLIGHT: {
      return handle(state, action, {
        success: prevState => prevState
          .set('flights', payload.data),
      });
    }
    default:
      return state;
  }
};
