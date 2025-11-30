import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, FileUp, Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { SearchResult, DrawnArea, ViewMode } from '../types/map.types';

interface SidebarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSearch?: (query: string) => void;
  onSearchResultSelect?: (result: SearchResult) => void;
  onUploadShapefile?: () => void;
  onBack?: () => void;
  searchResults?: SearchResult[];
  isSearching?: boolean;
  areas: DrawnArea[];
  onToggleAreaVisibility: (id: string) => void;
  onDeleteArea: (id: string) => void;
  onApplyOutline?: () => void;
  selectedSearchResult?: SearchResult | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  viewMode,
  onViewModeChange,
  onSearch,
  onSearchResultSelect,
  onUploadShapefile,
  onBack,
  searchResults = [],
  isSearching = false,
  areas,
  onToggleAreaVisibility,
  onDeleteArea,
  onApplyOutline,
  selectedSearchResult
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(() => {
        onSearch?.(searchQuery);
        setShowResults(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowResults(false);
    }
  }, [searchQuery, onSearch]);

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchQuery(result.display_name);
    setShowResults(false);
    onSearchResultSelect?.(result);
  };

  // Define AOI View
  if (viewMode === 'define-aoi') {
    return (
      <aside className="w-96 bg-cream flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-orange-primary/20">
          <button 
            onClick={onBack}
            className="flex items-center text-orange-primary hover:text-orange-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-semibold text-orange-primary mb-2">
            Define Area of Interest
          </h1>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <p className="text-text-dark text-base mb-6 leading-relaxed">
            Search or use vector tool to create your region.
          </p>

          <h3 className="text-text-dark font-semibold text-sm mb-4">
            Search Area
          </h3>

          {/* Search Box */}
          <div className="mb-4 relative">
            <div className="relative bg-white rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
              <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="city, town, region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-base text-gray-700 placeholder-gray-400 bg-transparent outline-none rounded-lg"
              />
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-300 shadow-lg z-10 max-h-64 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchResultClick(result)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900 text-sm">
                      {result.display_name.split(',')[0]}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {result.display_name}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-300 shadow-lg p-4 text-center text-gray-500">
                Searching...
              </div>
            )}
          </div>

          {/* Apply Outline Button - Shows when search result is selected */}
          {selectedSearchResult && (
            <button
              onClick={onApplyOutline}
              className="w-full bg-orange-primary text-white rounded-lg p-4 hover:bg-orange-600 transition-colors flex items-center justify-center mb-4 font-medium"
            >
              Apply outline as base image
            </button>
          )}

          {/* Upload Shapefile Button */}
          <button
            onClick={onUploadShapefile}
            className="w-full bg-white rounded-lg border border-gray-300 p-4 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center"
          >
            <FileUp className="w-5 h-5 text-gray-500 mr-3" />
            <span className="text-base text-gray-600">
              Uploading a shape file
            </span>
          </button>

          {selectedSearchResult && (
            <p className="text-xs text-gray-500 mt-4">
              You can always edit the shape of the area later
            </p>
          )}
        </div>
      </aside>
    );
  }

  // Project Scope View
  return (
    <aside className="w-96 bg-cream flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-orange-primary/20">
        <button 
          onClick={onBack}
          className="flex items-center text-orange-primary hover:text-orange-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-2xl font-semibold text-orange-primary mb-2">
          Define Project Scope
        </h1>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        {/* Select Base Image */}
        <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors mb-4">
          <span className="text-gray-700 font-medium">▶ Select Base Image</span>
          <Plus className="w-5 h-5 text-gray-500" />
        </button>

        {/* Define Area of Interest */}
        <div className="mb-6">
          <button 
            onClick={() => onViewModeChange('define-aoi')}
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors mb-3"
          >
            <span className="text-gray-700 font-medium">▼ Define Area of Interest</span>
            <Plus className="w-5 h-5 text-gray-500" />
          </button>

          {/* Areas List */}
          {areas.length > 0 && (
            <div className="space-y-2 ml-4">
              {areas.map((area) => (
                <div
                  key={area.id}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-lg group"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: area.color }}
                    />
                    <span className="text-sm text-gray-700">{area.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onToggleAreaVisibility(area.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {area.visible ? (
                        <Eye className="w-4 h-4 text-gray-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteArea(area.id)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Define Objects */}
        <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
          <span className="text-gray-700 font-medium">▶ Define Objects</span>
          <Plus className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;