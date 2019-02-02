import { Map } from 'immutable';
import { handle } from 'redux-pack';
import { AsyncStorage } from 'react-native';
import { QuadTree, Box } from 'js-quadtree';

import NavigationService from '../navigation/NavigationService';
import GeoLocation from '../model/GeoLocation';
import * as SQLiteUtils from '../utils/SQLiteUtils';
import {
  getLocations,
  login,
  signup,
  setUserPushToken,
  saveTiles,
  saveLastTile,
  removeTile,
} from '../services/api';
import LatLng from '../model/LatLng';
import Point from '../model/Point';
import * as Earth from '../constants/Earth';

const config = {
  capacity: 10,
  removeEmptyNodes: true,
};

export const types = {
  LOGIN: 'USER/LOGIN',
  LOGOUT: 'USER/LOGOUT',
  SIGNUP: 'USER/SIGNUP',
  RELOG_USER: 'USER/RELOG_USER',
  RELOG_FROM_SQLITE: 'USER/RELOG_FROM_SQLITE',
  SET_EMAIL_ERROR: 'USER/SET_EMAIL_ERROR',
  SET_PASSWORD_ERROR: 'USER/SET_PASSWORD_ERROR',
  SET_QUADTREE: 'USER/SET_QUADTREE',
  SET_LOCATIONS: 'USER/SET_LOCATIONS',
  SET_TILES_TO_SAVE: 'USER/SET_TILES_TO_SAVE',
  SAVE_TILES: 'USER/SAVE_TILES',
  SAVE_LAST_TILE: 'USER/SAVE_LAST_TILE',
  REMOVE_TILE: 'USER/REMOVE_TILE',
  SET_PUSH_TOKEN: 'USER/SET_PUSH_TOKEN',
  SET_USER_PUSH_TOKEN: 'USER/SET_USER_PUSH_TOKEN',
  SET_SCORE: 'USER/SET_SCORE',
};

const setUserAsync = async (id, username) => {
  await AsyncStorage.setItem('id', id.toString());
  await AsyncStorage.setItem('username', username.toString());
};

const removeUserAsync = async () => {
  await AsyncStorage.removeItem('id');
  await AsyncStorage.setItem('username');
};

const setTilesToSaveAsync = async (tilesToSave) => {
  await AsyncStorage.setItem('tilesToSave', JSON.stringify(tilesToSave));
};

const calculateChunkAsync = (quadtree, allPoints, start, end) => new Promise((resolve) => {
  setTimeout(() => {
    let score = 0;
    const realEnd = end > allPoints.length ? allPoints.length : end;
    for (let i = start; i < realEnd; i++) {
      const latLng = Point.toLatLngRounded(allPoints[i]);
      const gridDistanceAtLatitude = GeoLocation.gridDistanceAtLatitude(latLng.latitude);
      const box = new Box(
        allPoints[i].x - gridDistanceAtLatitude - Earth.ROUND_OFFSET,
        allPoints[i].y - Earth.GRID_DISTANCE - Earth.ROUND_OFFSET,
        (gridDistanceAtLatitude + Earth.ROUND_OFFSET) * 2,
        (Earth.GRID_DISTANCE + Earth.ROUND_OFFSET) * 2,
      );
      score += quadtree.query(box).length;
    }
    resolve(score);
  }, 0);
});

const calculateScoreAsync = quadtree => new Promise((resolve) => {
  const chunkSize = 1000;
  const allPoints = quadtree.getAllPoints();
  let score = 0;
  const promises = [];
  for (let i = 0; i < allPoints.length; i += chunkSize) {
    promises.push(calculateChunkAsync(quadtree, allPoints, i, i + chunkSize));
  }
  Promise.all(promises).then((chunkScores) => {
    chunkScores.forEach((x) => {
      score += x;
    });
    resolve(score);
  });
});

const calculateScore = (quadtree) => {
  const allPoints = quadtree.getAllPoints();
  let score = 0;
  for (let i = 0; i < allPoints.length; i++) {
    const latLng = Point.toLatLngRounded(allPoints[i]);
    const gridDistanceAtLatitude = GeoLocation.gridDistanceAtLatitude(latLng.latitude);
    const box = new Box(
      allPoints[i].x - gridDistanceAtLatitude - 0.00001,
      allPoints[i].y - Earth.GRID_DISTANCE - 0.00001,
      (gridDistanceAtLatitude + 0.00001) * 2,
      (Earth.GRID_DISTANCE + 0.00001) * 2,
    );
    score += quadtree.query(box).length;
  }
  return score;
};

export const actions = {
  login: (email, password, pushToken) => ({
    type: types.LOGIN,
    promise: login(email, password, pushToken),
    meta: {
      onSuccess: (result) => {
        setUserAsync(result.data.id, result.data.username);
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
        setUserAsync(result.data.id, result.data.username);
        NavigationService.navigate('Map');
      },
    },
  }),
  relogUser: (userId, username) => ({
    type: types.RELOG_USER,
    promise: getLocations(userId),
    meta: {
      username,
      onSuccess: () => {
        setUserAsync(userId, username);
        NavigationService.navigate('Map');
      },
      onFailure: () => {
        NavigationService.navigate('Login');
      },
    },
  }),
  relogFromSQLite: (userId, username, locations) => ({
    type: types.RELOG_FROM_SQLITE,
    userId,
    username,
    locations,
  }),
  setEmailError: error => ({ type: types.SET_EMAIL_ERROR, error }),
  setPasswordError: error => ({ type: types.SET_PASSWORD_ERROR, error }),
  setQuadtree: quadtree => ({ type: types.SET_QUADTREE, quadtree }),
  setLocations: locations => ({ type: types.SET_LOCATIONS, locations }),
  setTilesToSave: tilesToSave => ({ type: types.SET_TILES_TO_SAVE, tilesToSave }),
  saveTiles: (userId, tilesToSave) => ({
    type: types.SAVE_TILES,
    promise: saveTiles(userId.toString(), tilesToSave),
  }),
  saveLastTile: (userId, tile) => ({
    type: types.SAVE_LAST_TILE,
    promise: saveLastTile(userId.toString(), tile),
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
  setScore: quadtree => ({
    type: types.SET_SCORE,
    promise: calculateScoreAsync(quadtree),
  }),
};

const initialState = Map({
  isLoggedIn: false,
  userId: false,
  username: false,
  quadtree: new QuadTree(new Box(0, 0, 360, 180)),
  count: 0,
  score: 0,
  emailError: '',
  passwordError: '',
  tilesToSave: [],
  isSaving: false,
  isLoggingIn: false,
  pushToken: false,
});

export default (state = initialState, action = {}) => {
  const { type, payload, meta } = action;
  switch (type) {
    case types.LOGIN:
      return handle(state, action, {
        start: prevState => prevState.set('isLoggingIn', true),
        success: (prevState) => {
          SQLiteUtils.insertLocations(payload.data.locations);
          const latlngs = payload.data.locations;
          const points = latlngs.map(x => LatLng.toPoint(x));
          const quadtree = new QuadTree(new Box(0, 0, 360, 180), config, points);
          return prevState
            .set('isLoggedIn', true)
            .set('userId', payload.data.id)
            .set('username', payload.data.username)
            .set('quadtree', quadtree)
            .set('count', quadtree.getAllPoints().length)
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
        .set('username', false)
        .set('quadtree', new QuadTree(new Box(0, 0, 360, 180)))
        .set('count', 0)
        .set('score', 0);
    case types.SIGNUP:
      return handle(state, action, {
        success: prevState => prevState
          .set('isLoggedIn', true)
          .set('userId', payload.data.id)
          .set('username', payload.data.username)
          .set('emailError', '')
          .set('passwordError', ''),
        failure: prevState => prevState
          .set('emailError', 'Email address already in use. Try to login instead.')
          .set('passwordError', ''),
      });
    case types.RELOG_USER:
      return handle(state, action, {
        success: (prevState) => {
          SQLiteUtils.insertLocations(payload.data.locations);
          const latlngs = payload.data.locations;
          const points = latlngs.map(x => LatLng.toPoint(x));
          const quadtree = new QuadTree(new Box(0, 0, 360, 180), config, points);
          return prevState
            .set('isLoggedIn', true)
            .set('userId', payload.data.id)
            .set('username', meta.username)
            .set('quadtree', quadtree)
            .set('count', quadtree.getAllPoints().length);
        },
      });
    case types.RELOG_FROM_SQLITE: {
      const latlngs = action.locations;
      const points = latlngs.map(x => LatLng.toPoint(x));
      const quadtree = new QuadTree(new Box(0, 0, 360, 180), config, points);
      setUserAsync(action.userId, action.username);
      setTimeout(() => NavigationService.navigate('Map'), 1000);
      return state
        .set('isLoggedIn', true)
        .set('userId', action.userId)
        .set('username', action.username)
        .set('quadtree', quadtree)
        .set('count', quadtree.getAllPoints().length);
    }
    case types.SET_EMAIL_ERROR:
      return state.set('emailError', action.error);
    case types.SET_PASSWORD_ERROR:
      return state.set('passwordError', action.error);
    case types.SET_QUADTREE: {
      const { quadtree } = action;
      return state.set('quadtree', quadtree).set('count', quadtree.getAllPoints().length);
    }
    case types.SET_LOCATIONS: {
      const latlngs = action.locations;
      const points = latlngs.map(x => LatLng.toPoint(x));
      const quadtree = new QuadTree(new Box(0, 0, 360, 180), config, points);
      return state.set('quadtree', quadtree).set('count', quadtree.getAllPoints().length);
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
    case types.SET_SCORE:
      return handle(state, action, {
        success: prevState => prevState.set('score', action.payload),
      });
    default:
      return state;
  }
};
