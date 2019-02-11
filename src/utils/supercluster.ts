import SuperCluster from 'supercluster';
import { VoltaChargers } from '../values/types';

export const supercluster = {
  init: (maxZoom = 14) =>
    // @ts-ignore
    new SuperCluster({
      maxZoom,
      initial: () => ({
        availableStations: 0,
        totalStations: 0,
      }),
      map: ({ chargers }: { chargers: VoltaChargers[] }) => ({
        availableStations: chargers
          ? chargers.reduce((sum, { available }) => sum + available, 0)
          : 0,
        totalStations: chargers
          ? chargers.reduce((sum, { total }) => sum + total, 0)
          : 0,
      }),
      reduce: (accumulated, properties) => {
        accumulated.availableStations += properties.availableStations;
        accumulated.totalStations += properties.totalStations;
      },
    }),
};

export const getChargerCount = (chargers?: VoltaChargers[]) => {
  if (chargers) {
    return {
      available: chargers.reduce((sum, { available }) => sum + available, 0),
      total: chargers.reduce((sum, { total }) => sum + total, 0),
      // ['L3', 'L1', 'L2', 'L1'] => 'L1+L2+L3'
      level: [...new Set(chargers.map(({ level }) => level))].sort().join('+'),
    };
  }

  return {
    available: 0,
    total: 0,
    level: 'N/A',
  };
};
