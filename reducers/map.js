import { Map } from 'immutable';
import { handle } from 'redux-pack';

import { getCountries, getAirports } from '../services/api';
import * as EarthUtils from '../utils/EarthUtils';

export const types = {
  SET_MAP: 'MAP/SET_MAP',
  SET_GEOLOCATION: 'MAP/SET_GEOLOCATION',
  SET_GEOCODE: 'MAP/SET_GEOCODE',
  SET_FOLLOW_LOCATION: 'MAP/SET_FOLLOW_LOCATION',
  GET_COUNTRIES: 'MAP/GET_COUNTRIES',
  GET_AIRPORTS: 'MAP/GET_AIRPORTS',
  SET_EDIT_MODE: 'MAP/SET_EDIT_MODE',
  SET_EDIT_TYPE: 'MAP/SET_EDIT_TYPE',
  SET_SHOW_FLIGHTS: 'MAP/SET_SHOW_FLIGHTS',
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
  getAirports: () => ({
    type: types.GET_AIRPORTS,
    promise: getAirports(),
  }),
  setEditMode: editMode => ({ type: types.SET_EDIT_MODE, editMode }),
  setEditType: editType => ({ type: types.SET_EDIT_TYPE, editType }),
  setShowFlights: showFlights => ({ type: types.SET_SHOW_FLIGHTS, showFlights }),
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
  airports: [],
  editMode: false,
  editType: 'buy',
  showFlights: false,
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
            region: EarthUtils.coordinatesToRegion([
              { latitude: x.lat_min, longitude: x.long_min },
              { latitude: x.lat_max, longitude: x.long_max },
            ]),
          }));
          return prevState.set('countries', countries);
        },
      });
    case types.GET_AIRPORTS:
      return handle(state, action, {
        success: prevState => prevState.set('airports', payload.data),
      });
    case types.SET_EDIT_MODE:
      return state.set('editMode', action.editMode);
    case types.SET_EDIT_TYPE:
      return state.set('editType', action.editType);
    case types.SET_SHOW_FLIGHTS:
      return state.set('showFlights', action.showFlights);
    default:
      return state;
  }
};
