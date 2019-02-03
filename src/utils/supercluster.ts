import SuperCluster from 'supercluster'

export const supercluster = {
  init: (maxZoom: number = 14) => (
    // @ts-ignore
    new SuperCluster({
      maxZoom: maxZoom,
      initial: () => ({
        availableStations: 0,
        totalStations: 0,
      }),
      map: (properties: any) => ({
        availableStations: properties.chargers ? properties.chargers[0].available : 0,
        totalStations: properties.chargers ? properties.chargers[0].total : 0,
      }),
      reduce: (accumulated: any, properties: any) => {
        accumulated.availableStations += properties.availableStations;
        accumulated.totalStations += properties.totalStations;
      },
    })
  ),
}