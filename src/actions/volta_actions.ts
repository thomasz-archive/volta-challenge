import { Dispatch } from 'react';
import { AnyAction } from 'redux';
import axios from 'axios';

import { VOLTA_LOAD_ALL_SITES } from './types';
import { GeoJSonObject } from '../values/types';
import { sitesToGeoJSON } from '../utils/volta_utils';

export type VoltaActionType = {
  type: string;
  sites: GeoJSonObject,
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
      sites: sitesToGeoJSON(sites.data),
    });
  }
);
