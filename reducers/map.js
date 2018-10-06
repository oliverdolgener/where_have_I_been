import { Map } from 'immutable';

export const types = {
  SET_GEOLOCATION: 'MAP/SET_GEOLOCATION',
  SET_GEOCODE: 'MAP/SET_GEOCODE',
  SET_FOLLOW_LOCATION: 'MAP/SET_FOLLOW_LOCATION',
  SET_ORIENTATION: 'MAP/SET_ORIENTATION',
  SET_FOLLOW_ORIENTATION: 'MAP/SET_FOLLOW_ORIENTATION',
};

export const actions = {
  setGeolocation: geolocation => ({ type: types.SET_GEOLOCATION, geolocation }),
  setGeocode: geocode => ({ type: types.SET_GEOCODE, geocode }),
  setFollowLocation: followLocation => ({ type: types.SET_FOLLOW_LOCATION, followLocation }),
  setOrientation: orientation => ({ type: types.SET_ORIENTATION, orientation }),
  setFollowOrientation: followOrientation => ({
    type: types.SET_FOLLOW_ORIENTATION,
    followOrientation,
  }),
};

const initialState = Map({
  geolocation: {
    location: {
      latitude: 52.558,
      longitude: 13.206497,
    },
  },
  geocode: {},
  followLocation: true,
  orientation: 0,
  followOrientation: false,
});

export default (state = initialState, action = {}) => {
  const { type } = action;
  switch (type) {
    case types.SET_GEOLOCATION:
      return state.set('geolocation', action.geolocation);
    case types.SET_GEOCODE:
      return state.set('geocode', action.geocode);
    case types.SET_FOLLOW_LOCATION:
      return state.set('followLocation', action.followLocation);
    case types.SET_ORIENTATION:
      return state.set('orientation', action.orientation);
    case types.SET_FOLLOW_ORIENTATION:
      return state.set('followOrientation', action.followOrientation);
    default:
      return state;
  }
};
