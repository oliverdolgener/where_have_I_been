import { Map } from 'immutable';
import { AsyncStorage, Platform } from 'react-native';
import { handle } from 'redux-pack';

import GeoLocation from '../model/GeoLocation';
import { getPlaces, getElevation } from '../services/api';
import * as Earth from '../constants/Earth';

export const types = {
  SET_MAP: 'MAP/SET_MAP',
  SET_GEOLOCATION: 'MAP/SET_GEOLOCATION',
  SET_GEOCODE: 'MAP/SET_GEOCODE',
  SET_FOLLOW_LOCATION: 'MAP/SET_FOLLOW_LOCATION',
  SET_EDIT_MODE: 'MAP/SET_EDIT_MODE',
  SET_MAPTYPE: 'MAP/SET_MAPTYPE',
  SET_THEME: 'MAP/SET_THEME',
  SET_SHAPE: 'MAP/SET_SHAPE',
  SET_LAST_TILE: 'MAP/SET_LAST_TILE',
  SET_REGION: 'MAP/SET_REGION',
  SET_PLACES: 'MAP/SET_PLACES',
  SET_ELEVATION: 'MAP/SET_ELEVATION',
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

function getGridDistanceByZoom(zoom) {
  if (zoom < 0.25) {
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
    return Earth.GRID_DISTANCE * 500;
  }

  return gridDistance / 50;
}

export const actions = {
  setMap: map => ({ type: types.SET_MAP, map }),
  setGeolocation: geolocation => ({ type: types.SET_GEOLOCATION, geolocation }),
  setGeocode: geocode => ({ type: types.SET_GEOCODE, geocode }),
  setFollowLocation: followLocation => ({ type: types.SET_FOLLOW_LOCATION, followLocation }),
  setEditMode: editMode => ({ type: types.SET_EDIT_MODE, editMode }),
  setMapType: mapType => ({ type: types.SET_MAPTYPE, mapType }),
  setTheme: theme => ({ type: types.SET_THEME, theme }),
  setShape: shape => ({ type: types.SET_SHAPE, shape }),
  setLastTile: lastTile => ({ type: types.SET_LAST_TILE, lastTile }),
  setRegion: region => ({ type: types.SET_REGION, region }),
  setPlaces: center => ({
    type: types.SET_PLACES,
    promise: getPlaces(center),
  }),
  setElevation: center => ({
    type: types.SET_ELEVATION,
    promise: getElevation(center),
  }),
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
  elevation: 0,
  followLocation: true,
  editMode: false,
  mapType: 'hybrid',
  theme: 'light',
  shape: 'rectangle',
  lastTile: {
    latitude: Earth.INITIAL_LOCATION.latitude,
    longitude: Earth.INITIAL_LOCATION.longitude,
  },
  region: {
    latitude: Earth.INITIAL_LOCATION.latitude,
    longitude: Earth.INITIAL_LOCATION.longitude,
    latitudeDelta: Earth.DELTA,
    longitudeDelta: Earth.DELTA,
  },
  zoom: false,
  gridDistance: Earth.GRID_DISTANCE,
  places: [],
});

export default (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case types.SET_MAP: {
      return state.set('map', action.map);
    }
    case types.SET_GEOLOCATION: {
      return state.set('geolocation', action.geolocation);
    }
    case types.SET_GEOCODE: {
      return state.set('geocode', action.geocode);
    }
    case types.SET_FOLLOW_LOCATION: {
      const map = state.get('map');
      action.followLocation
        && map
        && map.moveToRegion({
          latitude: state.get('geolocation').latitude,
          longitude: state.get('geolocation').longitude,
          latitudeDelta: Earth.DELTA,
          longitudeDelta: Earth.DELTA,
        });
      return state.set('followLocation', action.followLocation);
    }
    case types.SET_EDIT_MODE:
      return state.set('editMode', action.editMode);
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
    case types.SET_REGION: {
      const { region } = action;
      const zoom = region.longitudeDelta > 0 ? region.longitudeDelta : 360 + region.longitudeDelta;
      const gridDistance = getGridDistanceByZoom(zoom);
      let followLocation = state.get('followLocation');
      if (Platform.OS === 'ios' && !GeoLocation.isInRegion(state.get('geolocation'), region)) {
        followLocation = false;
      }
      return state
        .set('region', region)
        .set('zoom', zoom)
        .set('gridDistance', gridDistance)
        .set('followLocation', followLocation);
    }
    case types.SET_PLACES:
      return handle(state, action, {
        success: (prevState) => {
          // const places = payload.data.results.map(x => ({
          //   id: x.id,
          //   placeId: x.place_id,
          //   name: x.name,
          //   latitude: x.geometry.location.lat,
          //   longitude: x.geometry.location.lng,
          // }));
          const places = payload.data.response.venues.map(x => ({
            id: x.id,
            name: x.name,
            latitude: x.location.lat,
            longitude: x.location.lng,
          }));
          return prevState.set('places', places);
        },
      });
    case types.SET_ELEVATION:
      return handle(state, action, {
        success: prevState => prevState.set('elevation', payload.data.elevations[0].elevation),
      });
    default:
      return state;
  }
};
