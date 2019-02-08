import { combineReducers } from 'redux';

import { voltaSitesReducer, VoltaSitesReduxState } from './volta_sites_reducer';

export type ReduxState = {
  sites: VoltaSitesReduxState;
};

export const reducers = combineReducers({
  sites: voltaSitesReducer,
});
