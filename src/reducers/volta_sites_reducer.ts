import {
  VOLTA_LOAD_ALL_SITES,
} from '../actions/types';
import { VoltaActionType } from '../actions/volta_actions';
import { GeoJSonObject } from '../values/types';

export type VoltaSitesReduxState = GeoJSonObject;

const INITIAL_STATE: VoltaSitesReduxState = {
  type: 'FeatureCollection',
  features: [],
};

export const voltaSitesReducer = (state = INITIAL_STATE, action: VoltaActionType) => {
  switch (action.type) {
    case VOLTA_LOAD_ALL_SITES:
      return action.sites;
    default:
      return state;
  }
};
