import { Map } from 'immutable';
import { handle } from 'redux-pack';
import { AsyncStorage } from 'react-native';

import { getVacations, setVacation, getAirports } from '../services/api';
import Coordinate from '../model/Coordinate';
import * as EarthUtils from '../utils/EarthUtils';

export const types = {
  SET_MAP: 'MAP/SET_MAP',
  SET_GEOLOCATION: 'MAP/SET_GEOLOCATION',
  SET_GEOCODE: 'MAP/SET_GEOCODE',
  SET_FOLLOW_LOCATION: 'MAP/SET_FOLLOW_LOCATION',
  GET_COUNTRIES: 'MAP/GET_COUNTRIES',
  SET_COUNTRIES: 'MAP/SET_COUNTRIES',
  SET_VACATION: 'MAP/SET_VACATION',
  GET_AIRPORTS: 'MAP/GET_AIRPORTS',
  SET_EDIT_MODE: 'MAP/SET_EDIT_MODE',
  SET_SHOW_FLIGHTS: 'MAP/SET_SHOW_FLIGHTS',
  SET_SHOW_COUNTRIES: 'MAP/SET_SHOW_COUNTRIES',
  SET_MAPTYPE: 'MAP/SET_MAPTYPE',
  SET_THEME: 'MAP/SET_THEME',
  SET_LAST_TILE: 'USER/SET_LAST_TILE',
  SET_POWER_SAVER: 'USER/SET_POWER_SAVER',
};

const setMapTypeAsync = async (mapType) => {
  await AsyncStorage.setItem('mapType', mapType);
};

const setThemeAsync = async (theme) => {
  await AsyncStorage.setItem('theme', theme);
};

const setLastTileAsync = async (tile) => {
  await AsyncStorage.setItem('lastTile', JSON.stringify(tile));
};

const setPowerSaverAsync = async (powerSaver) => {
  await AsyncStorage.setItem('powerSaver', powerSaver);
};

export const actions = {
  setMap: map => ({ type: types.SET_MAP, map }),
  setGeolocation: geolocation => ({ type: types.SET_GEOLOCATION, geolocation }),
  setGeocode: geocode => ({ type: types.SET_GEOCODE, geocode }),
  setFollowLocation: followLocation => ({ type: types.SET_FOLLOW_LOCATION, followLocation }),
  getCountries: userId => ({
    type: types.GET_COUNTRIES,
    promise: getVacations(userId),
  }),
  setCountries: countries => ({ type: types.SET_COUNTRIES, countries }),
  setVacation: (userId, countryId, status) => ({
    type: types.SET_VACATION,
    promise: setVacation(userId, countryId, status),
  }),
  getAirports: () => ({
    type: types.GET_AIRPORTS,
    promise: getAirports(),
  }),
  setEditMode: editMode => ({ type: types.SET_EDIT_MODE, editMode }),
  setShowFlights: showFlights => ({ type: types.SET_SHOW_FLIGHTS, showFlights }),
  setShowCountries: showCountries => ({ type: types.SET_SHOW_COUNTRIES, showCountries }),
  setMapType: mapType => ({ type: types.SET_MAPTYPE, mapType }),
  setTheme: theme => ({ type: types.SET_THEME, theme }),
  setLastTile: lastTile => ({ type: types.SET_LAST_TILE, lastTile }),
  setPowerSaver: powerSaver => ({ type: types.SET_POWER_SAVER, powerSaver }),
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
  showFlights: false,
  showCountries: false,
  mapType: 'hybrid',
  theme: 'light',
  lastTile: new Coordinate(52.558, 13.206497),
  powerSaver: 'off',
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
            status: x.status,
          }));
          return prevState.set('countries', countries);
        },
      });
    case types.SET_COUNTRIES:
      return state.set('countries', action.countries);
    case types.GET_AIRPORTS:
      return handle(state, action, {
        success: prevState => prevState.set('airports', payload.data),
      });
    case types.SET_EDIT_MODE:
      return state.set('editMode', action.editMode);
    case types.SET_SHOW_FLIGHTS:
      return state.set('showFlights', action.showFlights);
    case types.SET_SHOW_COUNTRIES:
      return state.set('showCountries', action.showCountries);
    case types.SET_MAPTYPE:
      setMapTypeAsync(action.mapType);
      return state.set('mapType', action.mapType);
    case types.SET_THEME:
      setThemeAsync(action.theme);
      return state.set('theme', action.theme);
    case types.SET_LAST_TILE: {
      setLastTileAsync(action.lastTile);
      return state.set('lastTile', action.lastTile);
    }
    case types.SET_POWER_SAVER:
      setPowerSaverAsync(action.powerSaver);
      return state.set('powerSaver', action.powerSaver);
    default:
      return state;
  }
};
