import React from 'react';
import { Info } from 'lucide-react';

const TopBar = ({ onInfoClick }) => {
  return (
    <div className="top-bar bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">C</div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Chekup AI</h1>
          <p className="text-xs text-gray-500">Health Management</p>
        </div>
      </div>

      <button
        onClick={onInfoClick}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Trust & Policy Information"
      >
        <Info className="w-5 h-5" />
      </button>
    </div>
  );
};

export default TopBar;