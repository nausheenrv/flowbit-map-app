// import React, { useState, useRef } from 'react';
// import Sidebar from './components/Sidebar';
// import Map from './components/Map';
// import type { DrawnArea, SearchResult, MapView, ViewMode } from './types/map.types';
// import { getRandomAreaColor } from './utils/mapConfig';

// function App() {
//   const [viewMode, setViewMode] = useState<ViewMode>('define-aoi');
//   const [mapView, setMapView] = useState<MapView>('street');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [selectedSearchResult, setSelectedSearchResult] = useState<SearchResult | null>(null);
//   const [areas, setAreas] = useState<DrawnArea[]>([]);
//   const [isDrawingMode, setIsDrawingMode] = useState(false);
  
//   // Use ref to track the last search query to prevent duplicate searches
//   const lastSearchQuery = useRef('');

//   // Handle search with Nominatim API
//   const handleSearch = async (query: string) => {
//     if (query.length < 3) return;
    
//     // Prevent duplicate searches
//     if (query === lastSearchQuery.current) {
//       return;
//     }
    
//     lastSearchQuery.current = query;
//     setIsSearching(true);
//     setSearchQuery(query);

//     try {
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&polygon_geojson=1`
//       );
//       const data = await response.json();
//       setSearchResults(data);
//     } catch (error) {
//       console.error('Search error:', error);
//       setSearchResults([]);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   // Handle search result selection
//   const handleSearchResultSelect = (result: SearchResult) => {
//     setSelectedSearchResult(result);
//     setSearchResults([]);
//     lastSearchQuery.current = ''; // Reset so user can search again if needed
//   };

//   // Apply outline as base image - creates area from search result
//   const handleApplyOutline = () => {
//     if (!selectedSearchResult) return;

//     let coordinates: number[][][];

//     // If search result has GeoJSON polygon
//     if (selectedSearchResult.geojson && selectedSearchResult.geojson.type === 'Polygon') {
//       coordinates = selectedSearchResult.geojson.coordinates;
//     } 
//     // If it has a bounding box, create a rectangle
//     else if (selectedSearchResult.boundingbox) {
//       const [south, north, west, east] = selectedSearchResult.boundingbox.map(parseFloat);
//       coordinates = [[
//         [west, south],
//         [east, south],
//         [east, north],
//         [west, north],
//         [west, south] // Close the polygon
//       ]];
//     } 
//     // Fallback: create a small area around the point
//     else {
//       const lat = parseFloat(selectedSearchResult.lat);
//       const lon = parseFloat(selectedSearchResult.lon);
//       const offset = 0.01; // roughly 1km
//       coordinates = [[
//         [lon - offset, lat - offset],
//         [lon + offset, lat - offset],
//         [lon + offset, lat + offset],
//         [lon - offset, lat + offset],
//         [lon - offset, lat - offset]
//       ]];
//     }

//     const newArea: DrawnArea = {
//       id: `area-${Date.now()}`,
//       name: `Area ${areas.length + 1}`,
//       type: 'search',
//       coordinates,
//       visible: true,
//       color: getRandomAreaColor()
//     };

//     setAreas([...areas, newArea]);
//     setSelectedSearchResult(null);
//     setViewMode('project-scope');
//     lastSearchQuery.current = ''; // Reset search
    
//     // Switch to satellite view to see the area better
//     setMapView('satellite');
//   };

//   // Handle manual polygon drawing completion
//   const handlePolygonComplete = (coordinates: number[][][]) => {
//     const newArea: DrawnArea = {
//       id: `area-${Date.now()}`,
//       name: `Area ${areas.length + 1}`,
//       type: 'drawn',
//       coordinates,
//       visible: true,
//       color: getRandomAreaColor()
//     };

//     setAreas([...areas, newArea]);
//     setIsDrawingMode(false);
//     setViewMode('project-scope');
//   };

//   // Toggle area visibility
//   const handleToggleAreaVisibility = (id: string) => {
//     setAreas(areas.map(area =>
//       area.id === id ? { ...area, visible: !area.visible } : area
//     ));
//   };

//   // Delete area
//   const handleDeleteArea = (id: string) => {
//     setAreas(areas.filter(area => area.id !== id));
//   };

//   // Handle shapefile upload
//   const handleUploadShapefile = () => {
//     alert('Shapefile upload functionality - to be implemented\n\nIn production, this would:\n1. Open file picker\n2. Parse shapefile\n3. Convert to GeoJSON\n4. Add as new area');
//   };

//   // Toggle map view (street/satellite)
//   const handleToggleMapView = () => {
//     setMapView(mapView === 'street' ? 'satellite' : 'street');
//   };

//   // Handle restart
//   const handleRestart = () => {
//     setSelectedSearchResult(null);
//     setSearchResults([]);
//     setSearchQuery('');
//     lastSearchQuery.current = '';
//   };

//   // Handle back button
//   const handleBack = () => {
//     console.log('Back button clicked');
//     // In a real app, this would navigate to previous page
//   };

//   return (
//     <div className="h-screen w-full flex bg-gray-50">
//       <Sidebar
//         viewMode={viewMode}
//         onViewModeChange={setViewMode}
//         onSearch={handleSearch}
//         onSearchResultSelect={handleSearchResultSelect}
//         onUploadShapefile={handleUploadShapefile}
//         onBack={handleBack}
//         searchResults={searchResults}
//         isSearching={isSearching}
//         areas={areas}
//         onToggleAreaVisibility={handleToggleAreaVisibility}
//         onDeleteArea={handleDeleteArea}
//         onApplyOutline={handleApplyOutline}
//         selectedSearchResult={selectedSearchResult}
//       />
      
//       <Map
//         onRestart={handleRestart}
//         mapView={mapView}
//         onToggleView={handleToggleMapView}
//         areas={areas}
//         searchResult={selectedSearchResult}
//         isDrawingMode={isDrawingMode}
//         onPolygonComplete={handlePolygonComplete}
//       />
//     </div>
//   );
// }

// export default App;

import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import type { DrawnArea, SearchResult, MapView, ViewMode } from './types/map.types';
import { getRandomAreaColor } from './utils/mapConfig';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('define-aoi');
  const [mapView, setMapView] = useState<MapView>('street');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState<SearchResult | null>(null);
  const [areas, setAreas] = useState<DrawnArea[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // Use ref to track the last search query to prevent duplicate searches
  const lastSearchQuery = useRef('');

  // --------------------------------------------------------
// Load full state from localStorage on mount
// --------------------------------------------------------
useEffect(() => {
  const saved = localStorage.getItem('flowbit-state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);

      if (parsed.areas) setAreas(parsed.areas);
      if (parsed.mapView) setMapView(parsed.mapView);
      if (parsed.viewMode) setViewMode(parsed.viewMode);

      console.log("Loaded state from localStorage:", parsed);
    } catch (err) {
      console.error("Error loading state:", err);
    }
  }
}, []);

// --------------------------------------------------------
// Save full state to localStorage whenever it changes
// --------------------------------------------------------
useEffect(() => {
  const payload = JSON.stringify({
    areas,
    mapView,
    viewMode,
  });
  localStorage.setItem('flowbit-state', payload);
}, [areas, mapView, viewMode]);

  // Load areas from localStorage on mount
  // useEffect(() => {
  //   const savedAreas = localStorage.getItem('flowbit-areas');
  //   if (savedAreas) {
  //     try {
  //       const parsed = JSON.parse(savedAreas) as DrawnArea[];
  //       setAreas(parsed);
  //       console.log('Loaded saved areas from localStorage:', parsed.length);
  //     } catch (error) {
  //       console.error('Error loading saved areas:', error);
  //     }
  //   }
  // }, []);

  // Save areas to localStorage whenever they change
  // useEffect(() => {
  //   if (areas.length > 0) {
  //     localStorage.setItem('flowbit-areas', JSON.stringify(areas));
  //     console.log('Saved areas to localStorage:', areas.length);
  //   } else {
  //     localStorage.removeItem('flowbit-areas');
  //   }
  // }, [areas]);

  // Handle search with Nominatim API
  const handleSearch = async (query: string) => {
    // keep the controlled input state updated
    setSearchQuery(query);

    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    // Prevent duplicate searches
    if (query === lastSearchQuery.current) return;

    lastSearchQuery.current = query;
    setIsSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&limit=5&polygon_geojson=1`,
        {
          headers: {
            // Nominatim requires a valid user agent; set a generic one. In production, use your app's UA.
            'User-Agent': 'flowbit-app/1.0 (your-email@example.com)'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = (await response.json()) as any[];

      // Map the raw response into our SearchResult shape if necessary
      const mapped: SearchResult[] = data.map((item) => ({
        // Keep all fields so Map/Sidebar can decide what to use
        ...item,
      }));

      setSearchResults(mapped);
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
    lastSearchQuery.current = ''; // Reset so user can search again if needed
    setSearchQuery(result.display_name || '');
  };

  // Apply outline as base image - creates area from search result
  const handleApplyOutline = () => {
    if (!selectedSearchResult) return;

    let coordinates: number[][][] = [];

    // If search result has GeoJSON polygon
    if (selectedSearchResult.geojson && selectedSearchResult.geojson.type === 'Polygon') {
      coordinates = selectedSearchResult.geojson.coordinates as number[][][];
    }
    // If it has a bounding box, create a rectangle. Note: nominatim boundingbox is [south, north, west, east] as strings
    else if (selectedSearchResult.boundingbox) {
      const parsed = selectedSearchResult.boundingbox.map((v: string) => parseFloat(v));
      // boundingbox returned by nominatim is [south, north, west, east]
      const south = parsed[0];
      const north = parsed[1];
      const west = parsed[2];
      const east = parsed[3];

      coordinates = [[
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south],
      ]];
    }
    // Fallback: create a small area around the point
    else if (selectedSearchResult.lat && selectedSearchResult.lon) {
      const lat = parseFloat(selectedSearchResult.lat);
      const lon = parseFloat(selectedSearchResult.lon);
      const offset = 0.01; // roughly ~1km depending on latitude
      coordinates = [[
        [lon - offset, lat - offset],
        [lon + offset, lat - offset],
        [lon + offset, lat + offset],
        [lon - offset, lat + offset],
        [lon - offset, lat - offset],
      ]];
    } else {
      console.warn('Selected search result has no geometry');
      return;
    }

    const newArea: DrawnArea = {
      id: `area-${Date.now()}`,
      name: `Area ${areas.length + 1}`,
      type: 'search',
      coordinates,
      visible: true,
      color: getRandomAreaColor(),
    };

    setAreas((prev) => [...prev, newArea]);
    setSelectedSearchResult(null);
    setViewMode('project-scope');
    lastSearchQuery.current = '';

    // Switch to satellite view to see the area better
    setMapView('satellite');
  };

  // Toggle drawing mode
  const handleToggleDrawMode = () => {
    setIsDrawingMode((prev) => !prev);
    if (!isDrawingMode) {
      // Disable any selected search result when entering draw mode
      setSelectedSearchResult(null);
    }
  };

  // Handle manual polygon drawing completion
  const handlePolygonComplete = (coordinates: number[][][]) => {
    const newArea: DrawnArea = {
      id: `area-${Date.now()}`,
      name: `Area ${areas.length + 1}`,
      type: 'drawn',
      coordinates,
      visible: true,
      color: getRandomAreaColor(),
    };

    setAreas((prev) => [...prev, newArea]);
    setIsDrawingMode(false);
    setViewMode('project-scope');
  };

  // Toggle area visibility
  const handleToggleAreaVisibility = (id: string) => {
    setAreas((prev) => prev.map((area) => (area.id === id ? { ...area, visible: !area.visible } : area)));
  };

  // Delete area
  const handleDeleteArea = (id: string) => {
    setAreas((prev) => prev.filter((area) => area.id !== id));
  };

  // Handle shapefile upload (stub)
  const handleUploadShapefile = () => {
    // In production you would open a file picker, parse and convert the shapefile to GeoJSON
    alert(
      'Shapefile upload functionality - to be implemented\n\nIn production, this would:\n1. Open file picker\n2. Parse shapefile\n3. Convert to GeoJSON\n4. Add as new area',
    );
  };

  // Toggle map view (street/satellite)
  const handleToggleMapView = () => {
    setMapView((prev) => (prev === 'street' ? 'satellite' : 'street'));
  };

  // Handle restart
  const handleRestart = () => {
    setSelectedSearchResult(null);
    setSearchResults([]);
    setSearchQuery('');
    lastSearchQuery.current = '';
  };

  // Handle back button
  const handleBack = () => {
    console.log('Back button clicked');
    // In a real app, this would navigate to previous page or history.back()
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
        onDrawModeToggle={handleToggleDrawMode}
        isDrawingMode={isDrawingMode}
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
};

export default App;
