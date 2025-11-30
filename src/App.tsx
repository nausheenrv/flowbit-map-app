import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import type { DrawnArea, SearchResult, MapView, ViewMode } from './types/map.types';
import { getRandomAreaColor } from './utils/mapConfig';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('define-aoi');
  const [mapView, setMapView] = useState<MapView>('street');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState<SearchResult | null>(null);
  const [areas, setAreas] = useState<DrawnArea[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // Handle search with Nominatim API
  const handleSearch = async (query: string) => {
    if (query.length < 3) return;

    setIsSearching(true);
    setSearchQuery(query);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&polygon_geojson=1`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result: SearchResult) => {
    setSelectedSearchResult(result);
    setSearchResults([]);
  };

  // Apply outline as base image - creates area from search result
  const handleApplyOutline = () => {
    if (!selectedSearchResult) return;

    let coordinates: number[][][];

    // If search result has GeoJSON polygon
    if (selectedSearchResult.geojson && selectedSearchResult.geojson.type === 'Polygon') {
      coordinates = selectedSearchResult.geojson.coordinates;
    } 
    // If it has a bounding box, create a rectangle
    else if (selectedSearchResult.boundingbox) {
      const [south, north, west, east] = selectedSearchResult.boundingbox.map(parseFloat);
      coordinates = [[
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south] // Close the polygon
      ]];
    } 
    // Fallback: create a small area around the point
    else {
      const lat = parseFloat(selectedSearchResult.lat);
      const lon = parseFloat(selectedSearchResult.lon);
      const offset = 0.01; // roughly 1km
      coordinates = [[
        [lon - offset, lat - offset],
        [lon + offset, lat - offset],
        [lon + offset, lat + offset],
        [lon - offset, lat + offset],
        [lon - offset, lat - offset]
      ]];
    }

    const newArea: DrawnArea = {
      id: `area-${Date.now()}`,
      name: `Area ${areas.length + 1}`,
      type: 'search',
      coordinates,
      visible: true,
      color: getRandomAreaColor()
    };

    setAreas([...areas, newArea]);
    setSelectedSearchResult(null);
    setViewMode('project-scope');
    
    // Switch to satellite view to see the area better
    setMapView('satellite');
  };

  // Handle manual polygon drawing completion
  const handlePolygonComplete = (coordinates: number[][][]) => {
    const newArea: DrawnArea = {
      id: `area-${Date.now()}`,
      name: `Area ${areas.length + 1}`,
      type: 'drawn',
      coordinates,
      visible: true,
      color: getRandomAreaColor()
    };

    setAreas([...areas, newArea]);
    setIsDrawingMode(false);
    setViewMode('project-scope');
  };

  // Toggle area visibility
  const handleToggleAreaVisibility = (id: string) => {
    setAreas(areas.map(area =>
      area.id === id ? { ...area, visible: !area.visible } : area
    ));
  };

  // Delete area
  const handleDeleteArea = (id: string) => {
    setAreas(areas.filter(area => area.id !== id));
  };

  // Handle shapefile upload
  const handleUploadShapefile = () => {
    alert('Shapefile upload functionality - to be implemented\n\nIn production, this would:\n1. Open file picker\n2. Parse shapefile\n3. Convert to GeoJSON\n4. Add as new area');
  };

  // Toggle map view (street/satellite)
  const handleToggleMapView = () => {
    setMapView(mapView === 'street' ? 'satellite' : 'street');
  };

  // Handle restart
  const handleRestart = () => {
    setSelectedSearchResult(null);
    setSearchResults([]);
    setSearchQuery('');
  };

  // Handle back button
  const handleBack = () => {
    console.log('Back button clicked');
    // In a real app, this would navigate to previous page
  };

  return (
    <div className="h-screen w-full flex bg-gray-50">
      <Sidebar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSearch={handleSearch}
        onSearchResultSelect={handleSearchResultSelect}
        onUploadShapefile={handleUploadShapefile}
        onBack={handleBack}
        searchResults={searchResults}
        isSearching={isSearching}
        areas={areas}
        onToggleAreaVisibility={handleToggleAreaVisibility}
        onDeleteArea={handleDeleteArea}
        onApplyOutline={handleApplyOutline}
        selectedSearchResult={selectedSearchResult}
      />
      
      <Map
        onRestart={handleRestart}
        mapView={mapView}
        onToggleView={handleToggleMapView}
        areas={areas}
        searchResult={selectedSearchResult}
        isDrawingMode={isDrawingMode}
        onPolygonComplete={handlePolygonComplete}
      />
    </div>
  );
}

export default App;