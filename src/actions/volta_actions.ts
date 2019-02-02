import { Dispatch } from 'react';
import { AnyAction } from 'redux';
import axios from 'axios';

import { VOLTA_LOAD_ALL_SITES } from './types';
import { VoltaSite } from '../values/types';

export type VoltaActionType = {
  type: string;
  sites: VoltaSite[],
};

export const loadAllSites = () => (
  async (dispatch: Dispatch<AnyAction>) => {
    const sites = await axios.get('https://api.voltaapi.com/v1/sites-metrics', {
      headers: {
        Accept: 'application/json',
      },
    });

    dispatch({
      type: VOLTA_LOAD_ALL_SITES,
      sites: sites.data,
    });
  }
);
