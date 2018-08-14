import { Map } from 'immutable';

export const types = {
  LOGIN: 'USER/LOGIN',
  LOGOUT: 'USER/LOGOUT',
};

export const actions = {
  login: user => ({ type: types.LOGIN, user }),
  logout: () => ({ type: types.LOGOUT }),
};

const initialState = Map({
  isLoggedIn: false,
  userId: false,
  visitedLocations: [],
});

export default (state = initialState, action) => {
  switch (action.type) {
    case types.LOGIN:
      return state
        .set('isLoggedIn', true)
        .set('userId', action.user.id)
        .set('visitedLocations', action.user.locations);
    case types.LOGOUT:
      return state
        .set('isLoggedIn', false)
        .set('userId', false)
        .set('visitedLocations', []);
    default:
      return state;
  }
};
