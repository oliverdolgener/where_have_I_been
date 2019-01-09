import { Map } from 'immutable';
import { Dimensions, Platform } from 'react-native';

export const types = {
  RESIZE: 'APP/RESIZE',
};

export const actions = {
  resize: dimensions => ({ type: types.RESIZE, dimensions }),
};

const { width, height } = Dimensions.get('window');
const initialState = Map({
  os: Platform.OS,
  width,
  height,
});

export default (state = initialState, action) => {
  switch (action.type) {
    case types.RESIZE: {
      const viewport = action.dimensions.window;
      return state.set('width', viewport.width).set('height', viewport.height);
    }
    default:
      return state;
  }
};
