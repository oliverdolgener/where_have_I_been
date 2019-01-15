import { Map } from 'immutable';
import { handle } from 'redux-pack';

import {
  getAirports, getFlights, addFlight, removeFlight,
} from '../services/api';

export const types = {
  GET_AIRPORTS: 'FLIGHT/GET_AIRPORTS',
  SET_SHOW_FLIGHTS: 'FLIGHT/SET_SHOW_FLIGHTS',
  GET_FLIGHTS: 'FLIGHT/GET_FLIGHTS',
  ADD_FLIGHT: 'FLIGHT/ADD_FLIGHT',
  REMOVE_FLIGHT: 'FLIGHT/REMOVE_FLIGHT',
};

export const actions = {
  getAirports: () => ({
    type: types.GET_AIRPORTS,
    promise: getAirports(),
  }),
  setShowFlights: showFlights => ({ type: types.SET_SHOW_FLIGHTS, showFlights }),
  getFlights: userId => ({
    type: types.GET_FLIGHTS,
    promise: getFlights(userId),
  }),
  addFlight: (userId, from, to) => ({
    type: types.ADD_FLIGHT,
    promise: addFlight(userId, from, to),
  }),
  removeFlight: (userId, from, to) => ({
    type: types.REMOVE_FLIGHT,
    promise: removeFlight(userId, from, to),
  }),
};

const initialState = Map({
  airports: [],
  showFlights: false,
  flights: [],
});

export default (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case types.GET_AIRPORTS: {
      return handle(state, action, {
        success: prevState => prevState.set('airports', payload.data),
      });
    }
    case types.SET_SHOW_FLIGHTS:
      return state.set('showFlights', action.showFlights);
    case types.GET_FLIGHTS: {
      return handle(state, action, {
        success: prevState => prevState.set('flights', payload.data),
      });
    }
    case types.ADD_FLIGHT: {
      return handle(state, action, {
        success: prevState => prevState.set('flights', payload.data),
      });
    }
    case types.REMOVE_FLIGHT: {
      return handle(state, action, {
        success: prevState => prevState.set('flights', payload.data),
      });
    }
    default:
      return state;
  }
};
