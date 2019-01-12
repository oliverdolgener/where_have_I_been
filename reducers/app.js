import { Map } from 'immutable';
import { Dimensions, Platform, AppState } from 'react-native';

export const types = {
  RESIZE: 'APP/RESIZE',
  SET_APP_STATE: 'APP/SET_APP_STATE',
};

export const actions = {
  resize: dimensions => ({ type: types.RESIZE, dimensions }),
  setAppState: appState => ({ type: types.SET_APP_STATE, appState }),
};

const { width, height } = Dimensions.get('window');
const initialState = Map({
  os: Platform.OS,
  appState: AppState.currentState,
  width,
  height,
});

export default (state = initialState, action) => {
  switch (action.type) {
    case types.RESIZE: {
      const viewport = action.dimensions.window;
      return state.set('width', viewport.width).set('height', viewport.height);
    }
    case types.SET_APP_STATE: {
      return state.set('appState', action.appState);
    }
    default:
      return state;
  }
};
