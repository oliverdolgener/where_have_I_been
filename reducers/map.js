import { Map } from 'immutable';
import { handle } from 'redux-pack';

import { getCountries } from '../services/api';

export const types = {
  SET_MAP: 'MAP/SET_MAP',
  SET_GEOLOCATION: 'MAP/SET_GEOLOCATION',
  SET_GEOCODE: 'MAP/SET_GEOCODE',
  SET_FOLLOW_LOCATION: 'MAP/SET_FOLLOW_LOCATION',
  GET_COUNTRIES: 'MAP/GET_COUNTRIES',
};

export const actions = {
  setMap: map => ({ type: types.SET_MAP, map }),
  setGeolocation: geolocation => ({ type: types.SET_GEOLOCATION, geolocation }),
  setGeocode: geocode => ({ type: types.SET_GEOCODE, geocode }),
  setFollowLocation: followLocation => ({ type: types.SET_FOLLOW_LOCATION, followLocation }),
  getCountries: () => ({
    type: types.GET_COUNTRIES,
    promise: getCountries(),
  }),
};

const initialState = Map({
  map: false,
  geolocation: {
    location: {
      latitude: 52.558,
      longitude: 13.206497,
    },
  },
  geocode: {},
  followLocation: true,
  countries: [],
});

export default (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case types.SET_MAP:
      return state.set('map', action.map);
    case types.SET_GEOLOCATION:
      return state.set('geolocation', action.geolocation);
    case types.SET_GEOCODE:
      return state.set('geocode', action.geocode);
    case types.SET_FOLLOW_LOCATION:
      return state.set('followLocation', action.followLocation);
    case types.GET_COUNTRIES:
      return handle(state, action, {
        success: (prevState) => {
          const countries = payload.data.map(x => ({
            id: x.id.toString(),
            name: x.name,
            region: {
              latitude: x.latitude,
              longitude: x.longitude,
              latitudeDelta: x.latitude_delta,
              longitudeDelta: x.longitude_delta,
            },
          }));
          return prevState.set('countries', countries);
        },
      });
    default:
      return state;
  }
};
