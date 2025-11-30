import React from 'react';
import { MapPin } from 'lucide-react';

interface HeaderProps {
  onSave?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSave }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            AOI Creation Tool
          </h1>
        </div>
        
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Save AOI
        </button>
      </div>
    </header>
  );
};

export default Header;