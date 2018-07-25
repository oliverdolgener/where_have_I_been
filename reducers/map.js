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

export default (state = initialState, action) => {
  switch (action.type) {
    case types.SETMAPVIEW:
      return state.set('mapView', action.mapView);
    default:
      return state;
  }
};
