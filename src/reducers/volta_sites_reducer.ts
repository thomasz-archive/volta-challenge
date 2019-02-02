import {
  VOLTA_LOAD_ALL_SITES,
} from '../actions/types';
import { VoltaActionType } from '../actions/volta_actions';
import { VoltaSite } from '../values/types';

export type VoltaSitesReduxState = VoltaSite[];

const INITIAL_STATE: VoltaSitesReduxState = [];

export const voltaSitesReducer = (state = INITIAL_STATE, action: VoltaActionType) => {
  switch (action.type) {
    case VOLTA_LOAD_ALL_SITES:
      return action.sites;
    default:
      return state;
  }
};
