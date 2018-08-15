import { Map } from 'immutable';
import { handle } from 'redux-pack';
import { NavigationActions } from 'react-navigation';
import { AsyncStorage } from 'react-native';

import { getUser, login, signup } from '../services/api';
import { navigator } from '../App';

export const types = {
  LOGIN: 'USER/LOGIN',
  LOGOUT: 'USER/LOGOUT',
  SIGNUP: 'USER/SIGNUP',
  GET_USER: 'USER/GET_USER',
  SET_EMAIL_ERROR: 'USER/SET_EMAIL_ERROR',
  SET_PASSWORD_ERROR: 'USER/SET_PASSWORD_ERROR',
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
};

const initialState = Map({
  isLoggedIn: false,
  userId: false,
  visitedLocations: [],
  emailError: '',
  passwordError: '',
});

export default (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case types.LOGIN:
      return handle(state, action, {
        success: prevState => prevState
          .set('isLoggedIn', true)
          .set('userId', payload.data._id)
          .set('visitedLocations', payload.data.locations)
          .set('emailError', '')
          .set('passwordError', ''),
        failure: prevState => prevState
          .set('emailError', '')
          .set('passwordError', 'Wrong Email or Password'),
      });
    case types.LOGOUT:
      removeUserAsync();
      navigator.dispatch(NavigationActions.navigate({ routeName: 'Login' }));
      return state
        .set('isLoggedIn', false)
        .set('userId', false)
        .set('visitedLocations', []);
    case types.SIGNUP:
      return handle(state, action, {
        success: prevState => prevState
          .set('isLoggedIn', true)
          .set('userId', payload.data._id)
          .set('visitedLocations', payload.data.locations)
          .set('emailError', '')
          .set('passwordError', ''),
        failure: prevState => prevState
          .set('emailError', 'Email address already in use. Try to login instead.')
          .set('passwordError', ''),
      });
    case types.GET_USER:
      return handle(state, action, {
        success: prevState => prevState
          .set('isLoggedIn', true)
          .set('userId', payload.data._id)
          .set('visitedLocations', payload.data.locations),
      });
    case types.SET_EMAIL_ERROR:
      return state.set('emailError', action.error);
    case types.SET_PASSWORD_ERROR:
      return state.set('passwordError', action.error);
    default:
      return state;
  }
};
