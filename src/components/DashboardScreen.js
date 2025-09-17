import React from 'react';
import { motion } from 'framer-motion';

const DashboardScreen = ({ userData, onDataUpdate, onConsentToggle, onNavigate }) => {
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
      {/* Header */}
      <div className="px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Health Dashboard</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your health data and family records</p>
      </div>

      {/* Health Summary */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-4 border border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600 mb-1">Health Records</p>
              <p className="text-2xl font-semibold text-gray-900">{totalFiles}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Family Members</p>
              <p className="text-2xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onNavigate?.('upload')}
            className="bg-blue-600 text-white p-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            📄 Upload Documents
          </button>
          <button 
            onClick={() => onNavigate?.('family')}
            className="bg-green-600 text-white p-3 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
          >
            👥 Family Health
          </button>
        </div>
      </div>

      {/* Family Health */}
      <div className="px-4 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900 text-sm">Family Health</h3>
            <button 
              onClick={() => onNavigate?.('family')}
              className="text-blue-600 text-xs"
            >
              Manage
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">👤</span>
              <span className="text-xs text-gray-600">John Doe (You)</span>
              <span className="text-[10px] px-2 py-1 rounded bg-green-100 text-green-600">Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">👩</span>
              <span className="text-xs text-gray-600">Sarah Doe (Wife)</span>
              <span className="text-[10px] px-2 py-1 rounded bg-green-100 text-green-600">Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">👶</span>
              <span className="text-xs text-gray-600">Emma Doe (Daughter)</span>
              <span className="text-[10px] px-2 py-1 rounded bg-yellow-100 text-yellow-600">Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Health Assistant */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm">Health Assistant</h3>
              <p className="text-xs text-gray-600">AI-powered health insights</p>
            </div>
            <button 
              onClick={() => onNavigate?.('chatbot')}
              className="bg-purple-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-purple-700 transition-colors"
            >
              Chat
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardScreen;
