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

// Component to handle map fly-to on search AND show preview polygon
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

// Preview polygon for selected search result
const SearchResultPreview: React.FC<{ searchResult: SearchResult | null }> = ({ searchResult }) => {
  if (!searchResult) return null;

  let coordinates: [number, number][];

  // If has GeoJSON polygon
  if (searchResult.geojson && searchResult.geojson.type === 'Polygon') {
    coordinates = searchResult.geojson.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
  }
  // If has bounding box
  else if (searchResult.boundingbox) {
    const [south, north, west, east] = searchResult.boundingbox.map(parseFloat);
    coordinates = [
      [south, west],
      [south, east],
      [north, east],
      [north, west],
      [south, west]
    ];
  }
  // Fallback: small area around point
  else {
    const lat = parseFloat(searchResult.lat);
    const lon = parseFloat(searchResult.lon);
    const offset = 0.01;
    coordinates = [
      [lat - offset, lon - offset],
      [lat - offset, lon + offset],
      [lat + offset, lon + offset],
      [lat + offset, lon - offset],
      [lat - offset, lon - offset]
    ];
  }

  return (
    <Polygon
      positions={coordinates}
      pathOptions={{
        color: '#FF6B35',
        fillColor: '#FF6B35',
        fillOpacity: 0.2,
        weight: 3,
        dashArray: '10, 10'
      }}
    />
  );
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
    if (!isDrawing) {
      // Clean up when drawing mode is disabled
      if (drawingRef.current) {
        map.removeLayer(drawingRef.current);
        drawingRef.current = null;
      }
      pointsRef.current = [];
      return;
    }

    const handleClick = (e: L.LeafletMouseEvent) => {
      pointsRef.current.push(e.latlng);

      if (drawingRef.current) {
        map.removeLayer(drawingRef.current);
      }

      // Draw temporary line
      drawingRef.current = L.polyline(pointsRef.current, {
        color: '#FFD700',
        weight: 3,
        dashArray: '5, 5'
      }).addTo(map);
    };

    const handleDblClick = (e: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e);
      
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

    // Change cursor to crosshair
    map.getContainer().style.cursor = 'crosshair';

    return () => {
      map.off('click', handleClick);
      map.off('dblclick', handleDblClick);
      map.getContainer().style.cursor = '';
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
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
       <WMSTileLayer
  url={WMS_CONFIG.url}
  params={{
    version: WMS_CONFIG.version, // 1.1.1
    layers: WMS_CONFIG.layers,
    format: WMS_CONFIG.format,
    transparent: WMS_CONFIG.transparent,
  }}
  attribution={WMS_CONFIG.attribution}
/>

        )}

        {/* Preview polygon for selected search result (dashed orange) */}
        <SearchResultPreview searchResult={searchResult} />

        {/* Drawn Areas (solid colored) */}
        {areas.filter(area => area.visible).map((area) => (
          <Polygon
            key={area.id}
            positions={area.coordinates[0].map(coord => [coord[1], coord[0]])}
            pathOptions={{
              color: area.color,
              fillColor: area.color,
              fillOpacity: 0.3,
              weight: 2
            }}
          />
        ))}

        {/* Map Controller for search */}
        <MapController searchResult={searchResult} />

        {/* Drawing Layer */}
        {isDrawingMode && onPolygonComplete && (
          <DrawingLayer
            isDrawing={isDrawingMode}
            onPolygonComplete={onPolygonComplete}
          />
        )}

        {/* Map Controls */}
        <MapControls
          onRestart={onRestart || (() => {})}
          mapView={mapView}
          onToggleView={onToggleView}
        />
      </MapContainer>

      {/* Drawing Instructions */}
      {isDrawingMode && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium">
            Click to add points, double-click to complete polygon
          </p>
        </div>
      )}
    </div>
  );
};

export default Map;