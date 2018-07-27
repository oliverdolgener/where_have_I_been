import { AsyncStorage } from 'react-native';
import { Map } from 'immutable';

export const types = {
  SETMAPTYPE: 'MAP/SETMAPTYPE',
};

export const actions = {
  setMapType: mapType => ({ type: types.SETMAPTYPE, mapType }),
};

const initialState = Map({
  mapType: 'satellite',
});

const setMapTypeAsync = async (mapType) => {
  await AsyncStorage.setItem('mapType', mapType);
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.SETMAPTYPE:
      setMapTypeAsync(action.mapType);
      return state.set('mapType', action.mapType);
    default:
      return state;
  }
};
