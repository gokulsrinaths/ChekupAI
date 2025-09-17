import React from 'react';
import { motion } from 'framer-motion';

const DashboardScreen = ({ userData, onDataUpdate, onConsentToggle }) => {
  const handleToggleResearch = () => {
    const newConsent = !userData.allowResearch;
    onDataUpdate({ allowResearch: newConsent });
    onConsentToggle?.(newConsent);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleResearch();
    }
  };

  const getFileStatusColor = (status) => {
    switch (status) {
      case 'private': return 'text-red-600 bg-red-50';
      case 'shared': return 'text-green-600 bg-green-50';
      case 'earned': return 'text-money-green bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getFileStatusText = (status) => {
    switch (status) {
      case 'private': return 'Private';
      case 'shared': return 'Shared';
      case 'earned': return 'Earned';
      default: return 'Unknown';
    }
  };

  // Derived analytics
  const totalFiles = userData.files.length;

  const totalEarnings = userData.files.reduce((sum, f) => sum + (Number(f.earnings) || 0), 0);
  const latestFile = [...userData.files]
    .filter(f => !!f.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  return (
    <div className="min-h-screen bg-white pb-24 w-full max-w-mobile mx-auto">
      {/* Header with balance top-right */}
      <div className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-xl">
          <span className="text-xs text-gray-600">Balance</span>
          <span className="text-base font-semibold text-gray-900">${userData.balance.toFixed(2)}</span>
        </div>
      </div>

      {/* Summary (center) */}
      <div className="px-4 mb-4">
        <div className="brand-pulse rounded-2xl p-4 border border-gray-100 text-center">
          <p className="text-xs text-gray-600 mb-1">Files Uploaded</p>
          <p className="text-2xl font-semibold text-gray-900">{totalFiles}</p>
        </div>
      </div>

      {/* Latest Update */}
      <div className="px-4 mb-4">
        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600">Latest Update</p>
            {latestFile ? (
              <p className="text-xs text-gray-900 truncate">
                {latestFile.date} • {latestFile.name} ({latestFile.type})
              </p>
            ) : (
              <p className="text-xs text-gray-900">No recent updates</p>
            )}
          </div>
          {latestFile && (
            <span className={`text-[10px] px-2 py-1 rounded flex-shrink-0 ml-2 ${getFileStatusColor(latestFile.status)}`}>
              {getFileStatusText(latestFile.status)}
            </span>
          )}
        </div>
      </div>

      {/* Research Toggle Section */}
      <div className="px-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm">Research Participation</h3>
              <p className="text-xs text-gray-600">Share data for research</p>
            </div>
            <div
              onClick={handleToggleResearch}
              onKeyPress={handleKeyPress}
              tabIndex={0}
              role="switch"
              aria-checked={userData.allowResearch}
              aria-label="Allow anonymized data for research"
              className={`toggle-switch cursor-pointer flex-shrink-0 ${userData.allowResearch ? 'active' : ''}`}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardScreen;
