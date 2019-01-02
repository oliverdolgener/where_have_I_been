import { Map } from 'immutable';
import { handle } from 'redux-pack';
import { AsyncStorage } from 'react-native';

import {
  getVacations, setVacation, getAirports, getElevation,
} from '../services/api';
import GeoArray from '../model/GeoArray';
import * as SortUtils from '../utils/SortUtils';
import * as Earth from '../constants/Earth';

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
  SET_SHAPE: 'MAP/SET_SHAPE',
  SET_LAST_TILE: 'MAP/SET_LAST_TILE',
  SET_POWER_SAVER: 'MAP/SET_POWER_SAVER',
  GET_ELEVATION: 'MAP/GET_ELEVATION',
  SET_REGION: 'MAP/SET_REGION',
};

const setMapTypeAsync = async (mapType) => {
  await AsyncStorage.setItem('mapType', mapType);
};

const setThemeAsync = async (theme) => {
  await AsyncStorage.setItem('theme', theme);
};

const setShapeAsync = async (shape) => {
  await AsyncStorage.setItem('shape', shape);
};

const setLastTileAsync = async (tile) => {
  await AsyncStorage.setItem('lastTile', JSON.stringify(tile));
};

const setPowerSaverAsync = async (powerSaver) => {
  await AsyncStorage.setItem('powerSaver', powerSaver);
};

function getGridDistanceByZoom(zoom) {
  if (zoom < 0.1) {
    return Earth.GRID_DISTANCE;
  }

  let gridDistance;

  if (zoom < 1) {
    gridDistance = Math.round(zoom * 10) / 10;
  } else if (zoom < 10) {
    gridDistance = Math.round(zoom);
  } else {
    gridDistance = Math.round(zoom / 10) * 10;
  }

  if (gridDistance > 50) {
    return Earth.GRID_DISTANCE * 1000;
  }

  return gridDistance / 50;
}

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
  setShape: shape => ({ type: types.SET_SHAPE, shape }),
  setLastTile: lastTile => ({ type: types.SET_LAST_TILE, lastTile }),
  setPowerSaver: powerSaver => ({ type: types.SET_POWER_SAVER, powerSaver }),
  getElevation: coordinate => ({
    type: types.GET_ELEVATION,
    promise: getElevation(coordinate),
  }),
  setRegion: region => ({ type: types.SET_REGION, region }),
};

const initialState = Map({
  map: false,
  geolocation: {
    latitude: Earth.INITIAL_LOCATION.latitude,
    longitude: Earth.INITIAL_LOCATION.longitude,
    altitude: false,
    speed: false,
    accuracy: false,
    timestamp: false,
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
  shape: 'rectangle',
  lastTile: {
    latitude: Earth.INITIAL_LOCATION.latitude,
    longitude: Earth.INITIAL_LOCATION.longitude,
  },
  powerSaver: 'off',
  elevation: 0,
  region: {
    latitude: Earth.INITIAL_LOCATION.latitude,
    longitude: Earth.INITIAL_LOCATION.longitude,
    latitudeDelta: Earth.DELTA,
    longitudeDelta: Earth.DELTA,
  },
  zoom: false,
  gridDistance: Earth.GRID_DISTANCE,
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
          const countries = payload.data
            .map(x => ({
              id: x.id.toString(),
              name: x.name,
              region: GeoArray.toRegion([
                { latitude: x.lat_min, longitude: x.long_min },
                { latitude: x.lat_max, longitude: x.long_max },
              ]),
              status: x.status,
            }))
            .sort(SortUtils.byStatusDesc);
          return prevState.set('countries', countries);
        },
      });
    case types.SET_COUNTRIES: {
      const countries = action.countries.sort(SortUtils.byStatusDesc);
      return state.set('countries', countries);
    }
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
    case types.SET_SHAPE:
      setShapeAsync(action.shape);
      return state.set('shape', action.shape);
    case types.SET_LAST_TILE: {
      setLastTileAsync(action.lastTile);
      return state.set('lastTile', action.lastTile);
    }
    case types.SET_POWER_SAVER:
      setPowerSaverAsync(action.powerSaver);
      return state.set('powerSaver', action.powerSaver);
    case types.GET_ELEVATION:
      return handle(state, action, {
        success: (prevState) => {
          if (payload.data.results.length > 0) {
            return prevState.set('elevation', payload.data.results[0].elevation);
          }
          return prevState;
        },
      });
    case types.SET_REGION: {
      const { region } = action;
      const zoom = region.longitudeDelta > 0 ? region.longitudeDelta : 360 + region.longitudeDelta;
      const gridDistance = getGridDistanceByZoom(zoom);
      return state
        .set('region', region)
        .set('zoom', zoom)
        .set('gridDistance', gridDistance);
    }
    default:
      return state;
  }
};
