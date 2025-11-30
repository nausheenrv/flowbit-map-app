import type { MapPosition } from '../types/map.types';

// WMS Configuration for the satellite imagery
export const WMS_CONFIG = {
  url: 'https://www.wms.nrw.de/geobasis/wms_nw_dop',
  layers: 'nw_dop_rgb',
  format: 'image/png',
  transparent: true,
  attribution: '&copy; Geobasis NRW'
};

// Default map center (Cologne, Germany)
export const DEFAULT_MAP_POSITION: MapPosition = {
  lat: 50.9375,
  lng: 6.9603,
  zoom: 11
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