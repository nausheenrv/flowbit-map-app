import type { MapPosition } from '../types/map.types';

// WMS Configuration for the satellite imagery
export const WMS_CONFIG = {
  url: '/wms', // proxied path (see vite.config.ts)
  layers: 'nw_dop_rgb',
  format: 'image/png',
  transparent: false, // DOP is full imagery
  attribution: '&copy; Geobasis NRW',
  version: '1.1.1', // important to match Leaflet defaults (SRS)
};


// Default map center (Düsseldorf, Germany - in NRW region where WMS works)
export const DEFAULT_MAP_POSITION: MapPosition = {
  lat: 51.2277,
  lng: 6.7735,
  zoom: 12
};

// Colors for drawn areas
export const AREA_COLORS = [
  '#FFD700', // Gold/Yellow
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Orange
  '#98D8C8', // Mint
];

// Generate random color for new area
export const getRandomAreaColor = (): string => {
  return AREA_COLORS[Math.floor(Math.random() * AREA_COLORS.length)];
};