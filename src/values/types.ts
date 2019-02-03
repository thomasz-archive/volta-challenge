export type Bound = {
  lng0: number;
  lat0: number;
  lng1: number;
  lat1: number;
};

export type Coordinates = {
  accuracy: number;
  altitude: number;
  heading: number;
  latitude: number;
  longitude: number;
  speed: number;
};

export type GeoJSON = {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]
  },
  properties: VoltaSite | MapBoxOnChangeEvent | object;
}

export type GeoJSONCollection = {
  type: string;
  features: GeoJSON[];
};

export type VoltaLocation = {
  type: string;
  coordinates: [number, number];
};

export type VoltaStation = {
    id: string;
    name: string;
    site_id: string;
    status: string;
    geolocation: string;
    has_media_issue: boolean;
    meter_status: string[];
    media_player_status: string[];
    display_status: string[];
};

export type VoltaSite = {
  id: string;
  name: string;
  location: VoltaLocation;
  stations: VoltaStation[];
  chargers: {
    available: number,
    total: number,
    level: string,
  }[];
};

export type MapBoxOnChangeEvent = {
  visibleBounds: [number, number, number, number];
  zoomLevel: number;
};
