import { Map } from 'immutable';
import { handle } from 'redux-pack';
import { NavigationActions } from 'react-navigation';
import { AsyncStorage } from 'react-native';

import Coordinate from '../model/Coordinate';
import * as MathUtils from '../utils/MathUtils';
import * as EarthUtils from '../utils/EarthUtils';
import { getUser, login, signup } from '../services/api';
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
  SET_REGION: 'USER/SET_REGION',
};

const setUserAsync = async (id) => {
  await AsyncStorage.setItem('id', id);
};

const removeUserAsync = async () => {
  await AsyncStorage.removeItem('id');
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
};

const initialState = Map({
  isLoggedIn: false,
  userId: false,
  region: {
    latitude: 52.558,
    longitude: 13.206504,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  },
  visitedLocations: [],
  holes: [],
  emailError: '',
  passwordError: '',
});

const prepareLocations = (locations) => {
  const visitedLocations = locations.map(x => new Coordinate(x.latitude, x.longitude));
  return MathUtils.removeDuplicateLocations(visitedLocations);
};

const prepareHoles = (locations, region) => {
  const visibleLocations = locations.filter(x => x.isInRegion(region));
  return EarthUtils.getSliceCoordinates(visibleLocations);
};

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
      const holes = prepareHoles(visitedLocations, state.get('region'));
      return state.set('visitedLocations', visitedLocations).set('holes', holes);
    }
    case types.SET_REGION: {
      const holes = prepareHoles(state.get('visitedLocations'), action.region);
      return state.set('region', action.region).set('holes', holes);
    }
    default:
      return state;
  }
};
