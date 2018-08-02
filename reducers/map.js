import { AsyncStorage } from 'react-native';
import { Map } from 'immutable';

export const types = {
  SETMAPTYPE: 'MAP/SETMAPTYPE',
  SETTILESTOSAVE: 'MAP/SETTILESTOSAVE',
};

export const actions = {
  setMapType: mapType => ({ type: types.SETMAPTYPE, mapType }),
  setTilesToSave: tilesToSave => ({ type: types.SETTILESTOSAVE, tilesToSave }),
};

const initialState = Map({
  mapType: 'satellite',
  tilesToSave: [],
});

const setMapTypeAsync = async (mapType) => {
  await AsyncStorage.setItem('mapType', mapType);
};

const setTilesToSaveAsync = async (tilesToSave) => {
  await AsyncStorage.setItem('tilesToSave', JSON.stringify(tilesToSave));
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.SETMAPTYPE:
      setMapTypeAsync(action.mapType);
      return state.set('mapType', action.mapType);
    case types.SETTILESTOSAVE:
      setTilesToSaveAsync(action.tilesToSave);
      return state.set('tilesToSave', action.tilesToSave);
    default:
      return state;
  }
};
