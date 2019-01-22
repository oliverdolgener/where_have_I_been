import { Map } from 'immutable';
import { Dimensions, Platform, AppState } from 'react-native';

export const types = {
  RESIZE: 'APP/RESIZE',
  SET_APP_STATE: 'APP/SET_APP_STATE',
  SET_NOTIFICATION_PANEL: 'APP/SET_NOTIFICATION_PANEL',
};

export const actions = {
  resize: dimensions => ({ type: types.RESIZE, dimensions }),
  setAppState: appState => ({ type: types.SET_APP_STATE, appState }),
  setNotificationPanel: notificationPanel => ({ type: types.SET_NOTIFICATION_PANEL, notificationPanel }),
};

const { width, height } = Dimensions.get('window');
const initialState = Map({
  os: Platform.OS,
  appState: AppState.currentState,
  width,
  height,
  notificationPanel: false,
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
    case types.SET_NOTIFICATION_PANEL: {
      return state.set('notificationPanel', action.notificationPanel);
    }
    default:
      return state;
  }
};
