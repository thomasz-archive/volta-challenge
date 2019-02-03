import {
  Feature,
  GeoJsonProperties,
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

export type GeoJSONCollection = {
  type: string;
  features: Feature<Point, GeoJsonProperties>[];
};

export type VoltaLocation = {
  type: string;
  coordinates: [number, number];
};

export type VoltaStation = {
    id: string;
    name: string;
    geolocation: string;
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
