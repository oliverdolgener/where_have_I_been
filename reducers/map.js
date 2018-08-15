import { Map } from 'immutable';
import { handle } from 'redux-pack';
import { AsyncStorage } from 'react-native';

import { saveTiles } from '../services/api';

export const types = {
  SETMAPTYPE: 'MAP/SETMAPTYPE',
  SETTILESTOSAVE: 'MAP/SETTILESTOSAVE',
  SAVE_TILES: 'MAP/SAVE_TILES',
};

export const actions = {
  setMapType: mapType => ({ type: types.SETMAPTYPE, mapType }),
  setTilesToSave: tilesToSave => ({ type: types.SETTILESTOSAVE, tilesToSave }),
  saveTiles: (userId, tilesToSave) => ({
    type: types.SAVE_TILES,
    promise: saveTiles(userId, tilesToSave),
  }),
};

const initialState = Map({
  mapType: 'hybrid',
  tilesToSave: [],
});

const setMapTypeAsync = async (mapType) => {
  await AsyncStorage.setItem('mapType', mapType);
};

const setTilesToSaveAsync = async (tilesToSave) => {
  await AsyncStorage.setItem('tilesToSave', JSON.stringify(tilesToSave));
};

export default (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case types.SETMAPTYPE:
      setMapTypeAsync(action.mapType);
      return state.set('mapType', action.mapType);
    case types.SETTILESTOSAVE:
      setTilesToSaveAsync(action.tilesToSave);
      return state.set('tilesToSave', action.tilesToSave);
    case types.SAVE_TILES:
      return handle(state, action, {
        success: prevState => prevState
          .set('tilesToSave', []),
      });
    default:
      return state;
  }
};
