import {
  Feature,
  Point,
} from 'geojson';

export type Bound = [number, number, number, number];

export type Coordinates = {
  accuracy: number;
  altitude: number;
  heading: number;
  latitude: number;
  longitude: number;
  speed: number;
};

export type CitiesResponse = {
  zipcode: string;
  state_abbr: string;
  latitude: string;
  longitude: string;
  city: string;
  state: string;
};

export type GeoJSONCollection = {
  type: string;
  features: Feature<Point, VoltaSite>[];
};

export type SiteMetrics = {
  chargers: {
    available: number,
    total: number,
  };
  stations: object,
  chargerStatus: object,
};

export type VoltaLocation = {
  type: string;
  coordinates: [number, number];
};

export type VoltaStation = {
  id: string;
  name: string;
  geolocation: string;
  status: string;
  meter_status: string[];
};

export type VoltaChargers = {
  available: number,
  total: number,
  level: string,
};

export type VoltaSite = {
  id: string;
  name: string;
  location: VoltaLocation;
  stations: VoltaStation[];
  chargers: VoltaChargers[];
};

export type MapBoxOnChangeEvent = {
  visibleBounds: [number, number, number, number];
  zoomLevel: number;
};
