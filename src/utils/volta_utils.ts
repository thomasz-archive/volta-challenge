import {
  Feature,
  Point,
} from "geojson";

import {
  VoltaSite,
  VoltaStation,
} from "../values/types";

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

type AccumulatedResult = {
  [key: string]: {
    [key: string]: number;
  };
}
const convertToSectionList = (input: AccumulatedResult) => (
  Object.keys(input).map(section => ({
    title: section,
    data: Object.keys(input[section]).map(item => ({
      key: item,
      value: input[section][item]
    })),
  }))
);

type Accumulated = {
  [key: string]: number;
}
export const generateSummary = (data: Feature<Point, VoltaSite>[]) => {
  const emptyData = {
    chargers: {
      available: 0,
      total: 0,
    },
    stations: {},
    'charger status': {},
  };

  const raw = data.reduce((accumulated, { properties }) => {
    const { chargers } = accumulated;
    const { stations  } = properties;

    const available = !properties.chargers ? 0 : (
      properties.chargers.reduce((sum, charger) => sum + charger.available, 0)
    );

    const total = !properties.chargers ? 0 : (
      properties.chargers.reduce((sum, charger) => sum + charger.total, 0)
    );

    const currentStations = stations.reduce((accumulated, station: VoltaStation) => ({
      ...accumulated,
      [station.status]: (accumulated[station.status] || 0) + 1,
    }), {} as Accumulated);

    const accumulatedStations = Object.keys(currentStations).reduce((result, key) => ({
      ...result,
      [key]: (result[key] || 0) + currentStations[key],
      // total: (result['total'] || 0) + currentStations[key],
    }), accumulated.stations as Accumulated);

    const currentChargerStatus = stations.reduce((accumulated, station) => {
      if (!station['meter_status'].length) {
        return accumulated;
      } else {
        return station['meter_status'].reduce((result, chargerStatus) => ({
          ...result,
          [chargerStatus]: (result[chargerStatus] || 0) + 1,
        }), accumulated);
      }
    }, {} as Accumulated);

    const accumulatedChargerStatus = 
      Object.keys(currentChargerStatus).reduce((result, key) => ({
        ...result,
        [key]: (result[key] || 0) + currentChargerStatus[key],
        // total: (result['total'] || 0) + currentChargerStatus[key],
      }), accumulated['charger status'] as Accumulated)
    
    return {
      chargers: {
        available: chargers.available + available,
        total: chargers.total + total,
      },
      stations: accumulatedStations,
      'charger status': accumulatedChargerStatus,
    };
  }, emptyData) as AccumulatedResult;

  return {
    raw,
    sectionListData: convertToSectionList(raw),
  };
};
