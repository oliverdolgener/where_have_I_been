import { Map } from 'immutable';

export const types = {
  LOGIN: 'USER/LOGIN',
  LOGOUT: 'USER/LOGOUT',
};

export const actions = {
  login: () => ({ type: types.LOGIN }),
  logout: () => ({ type: types.LOGOUT }),
};

const initialState = Map({
  isLoggedIn: false,
});

export default (state = initialState, action) => {
  switch (action.type) {
    case types.LOGIN:
      return state.set('isLoggedIn', true);
    case types.LOGOUT:
      return state.set('isLoggedIn', false);
    default:
      return state;
  }
};
