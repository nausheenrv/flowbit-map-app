import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Polygon, useMap } from 'react-leaflet';
import { RotateCcw, Layers } from 'lucide-react';
import L from 'leaflet';
import { DEFAULT_MAP_POSITION, WMS_CONFIG } from '../utils/mapConfig';
import type { DrawnArea, MapView, SearchResult } from '../types/map.types';
import 'leaflet/dist/leaflet.css';

// Map Controls Component
const MapControls: React.FC<{
  onRestart: () => void;
  mapView: MapView;
  onToggleView: () => void;
}> = ({ onRestart, mapView, onToggleView }) => {
  const map = useMap();

  const handleRestart = () => {
    map.setView(
      [DEFAULT_MAP_POSITION.lat, DEFAULT_MAP_POSITION.lng],
      DEFAULT_MAP_POSITION.zoom
    );
    onRestart();
  };

  return (
    <>
      {/* View Toggle Button */}
      <button
        onClick={onToggleView}
        className="absolute top-6 right-6 z-[1000] bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 shadow-lg border border-gray-300"
      >
        <Layers className="w-4 h-4" />
        <span className="font-medium text-sm">
          {mapView === 'street' ? 'Satellite' : 'Street'}
        </span>
      </button>

      {/* Restart Button */}
      <button
        onClick={handleRestart}
        className="absolute bottom-6 right-6 z-[1000] bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center space-x-2 shadow-lg"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="font-medium">Restart</span>
        <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded">R</span>
      </button>
    </>
  );
};

// Component to handle map fly-to on search
const MapController: React.FC<{ searchResult: SearchResult | null }> = ({ searchResult }) => {
  const map = useMap();

  useEffect(() => {
    if (searchResult) {
      const lat = parseFloat(searchResult.lat);
      const lon = parseFloat(searchResult.lon);
      
      if (searchResult.boundingbox) {
        // Fly to bounding box
        const [south, north, west, east] = searchResult.boundingbox.map(parseFloat);
        const bounds: L.LatLngBoundsExpression = [[south, west], [north, east]];
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      } else {
        // Fly to point
        map.flyTo([lat, lon], 13, { duration: 1.5 });
      }
    }
  }, [searchResult, map]);

  return null;
};

// Component to enable drawing on map
const DrawingLayer: React.FC<{
  isDrawing: boolean;
  onPolygonComplete: (coordinates: number[][][]) => void;
}> = ({ isDrawing, onPolygonComplete }) => {
  const map = useMap();
  const drawingRef = useRef<L.Polyline | null>(null);
  const pointsRef = useRef<L.LatLng[]>([]);

  useEffect(() => {
    if (!isDrawing) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      pointsRef.current.push(e.latlng);

      if (drawingRef.current) {
        map.removeLayer(drawingRef.current);
      }

      // Draw temporary line
      drawingRef.current = L.polyline(pointsRef.current, {
        color: '#FFD700',
        weight: 2,
        dashArray: '5, 5'
      }).addTo(map);
    };

    const handleDblClick = () => {
      if (pointsRef.current.length >= 3) {
        // Convert to GeoJSON format
        const coordinates = [
          pointsRef.current.map(point => [point.lng, point.lat])
        ];
        
        // Close the polygon
        coordinates[0].push(coordinates[0][0]);

        onPolygonComplete(coordinates);

        // Clean up
        if (drawingRef.current) {
          map.removeLayer(drawingRef.current);
        }
        pointsRef.current = [];
        drawingRef.current = null;
      }
    };

    map.on('click', handleClick);
    map.on('dblclick', handleDblClick);

    return () => {
      map.off('click', handleClick);
      map.off('dblclick', handleDblClick);
      if (drawingRef.current) {
        map.removeLayer(drawingRef.current);
      }
    };
  }, [isDrawing, map, onPolygonComplete]);

  return null;
};

interface MapProps {
  onRestart?: () => void;
  mapView: MapView;
  onToggleView: () => void;
  areas: DrawnArea[];
  searchResult: SearchResult | null;
  isDrawingMode?: boolean;
  onPolygonComplete?: (coordinates: number[][][]) => void;
}

const Map: React.FC<MapProps> = ({
  onRestart,
  mapView,
  onToggleView,
  areas,
  searchResult,
  isDrawingMode = false,
  onPolygonComplete
}) => {
  return (
    <div className="relative flex-1 h-full">
      <MapContainer
        center={[DEFAULT_MAP_POSITION.lat, DEFAULT_MAP_POSITION.lng]}
        zoom={DEFAULT_MAP_POSITION.zoom}
        className="h-full w-full"
        zoomControl={true}
        doubleClickZoom={!isDrawingMode}
      >
        {/* Base Layer - Street or Satellite */}
        {mapView === 'street' ? (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        ) : (
          <WMSTileLayer
            url={WMS_CONFIG.url}
            layers={WMS_CONFIG.layers}
            format={WMS_CONFIG.format}
            transparent={WMS_CONFIG.transparent}
          />
        )}

        {/* Drawn Areas */}
        {areas.map((area) => (
          <Polygon key={area.id} positions={area.coordinates as L.LatLngExpression[][]} pathOptions={{ color: 'blue' }} />
        ))}

        {/* Map Controls */}
        {onRestart && <MapControls onRestart={onRestart} mapView={mapView} onToggleView={onToggleView} />}

        {/* Search Result Controller */}
        <MapController searchResult={searchResult} />

        {/* Drawing Layer */}
        {isDrawingMode && <DrawingLayer isDrawing={isDrawingMode} onPolygonComplete={onPolygonComplete || (() => {})} />}
      </MapContainer>
    </div>
  );
};

export default Map;