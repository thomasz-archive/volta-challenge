import { VoltaSite } from "../values/types";

const siteToGeoJSONPoint = (site: VoltaSite) => {
  return {
    type: "Feature",
    geometry: site.location,
    properties: site
  };
};

export const sitesToGeoJSON = (sites: VoltaSite[]) => {
  return {
    type: 'FeatureCollection',
    features: sites.map(siteToGeoJSONPoint),
  }
}