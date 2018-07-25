import { AsyncStorage } from 'react-native';
import { Map } from 'immutable';

export const types = {
  SETMAPVIEW: 'MAP/SETMAPVIEW',
};

export const actions = {
  setMapView: mapView => ({ type: types.SETMAPVIEW, mapView }),
};

const initialState = Map({
  mapView: 'satellite',
});

const setMapViewAsync = async (mapView) => {
  await AsyncStorage.setItem('mapView', mapView);
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.SETMAPVIEW:
      setMapViewAsync(action.mapView);
      return state.set('mapView', action.mapView);
    default:
      return state;
  }
};
