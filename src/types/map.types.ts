export interface MapPosition {
  lat: number;
  lng: number;
  zoom: number;
}

export interface DrawnArea {
  id: string;
  name: string;
  type: 'search' | 'drawn';
  coordinates: number[][][]; // GeoJSON Polygon format
  visible: boolean;
  color: string;
}

export interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  boundingbox?: string[]; // [south, north, west, east]
  geojson?: any; // GeoJSON geometry
}

export type MapView = 'street' | 'satellite';

export type ViewMode = 'define-aoi' | 'project-scope';