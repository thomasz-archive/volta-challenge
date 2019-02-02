import { isBetween } from './math';
import {
  Bound,
  VoltaSite,
} from '../values/types';

export const getVisibleSites = (sites: VoltaSite[], bound: Bound) => sites.filter(site => {
  const [lng, lat] = site.location.coordinates;
  return isBetween(lng, bound.lng0, bound.lng1) && 
    isBetween(lat, bound.lat0, bound.lat1);
});
