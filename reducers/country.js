import { Map } from 'immutable';
import { handle } from 'redux-pack';

import { getVacations, setVacation } from '../services/api';
import GeoArray from '../model/GeoArray';
import * as SortUtils from '../utils/SortUtils';

export const types = {
  GET_COUNTRIES: 'MAP/GET_COUNTRIES',
  SET_COUNTRIES: 'MAP/SET_COUNTRIES',
  SET_VACATION: 'MAP/SET_VACATION',
  SET_SHOW_COUNTRIES: 'MAP/SET_SHOW_COUNTRIES',
};

export const actions = {
  getCountries: userId => ({
    type: types.GET_COUNTRIES,
    promise: getVacations(userId),
  }),
  setCountries: countries => ({ type: types.SET_COUNTRIES, countries }),
  setVacation: (userId, countryId, status) => ({
    type: types.SET_VACATION,
    promise: setVacation(userId, countryId, status),
  }),
  setShowCountries: showCountries => ({ type: types.SET_SHOW_COUNTRIES, showCountries }),
};

const initialState = Map({
  countries: [],
  showCountries: false,
});

export default (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case types.GET_COUNTRIES: {
      return handle(state, action, {
        success: (prevState) => {
          const countries = payload.data
            .map(x => ({
              id: x.id.toString(),
              name: x.name,
              region: GeoArray.toRegion([
                { latitude: x.lat_min, longitude: x.long_min },
                { latitude: x.lat_max, longitude: x.long_max },
              ]),
              status: x.status,
            }))
            .sort(SortUtils.byStatusDesc);
          return prevState.set('countries', countries);
        },
      });
    }
    case types.SET_COUNTRIES: {
      const countries = action.countries.sort(SortUtils.byStatusDesc);
      return state.set('countries', countries);
    }
    case types.SET_SHOW_COUNTRIES:
      return state.set('showCountries', action.showCountries);
    default:
      return state;
  }
};
