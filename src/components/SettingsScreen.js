import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SettingsScreen = ({ userData, onDataUpdate, onViewAuditLog, onNavigate }) => {
  const [notifications, setNotifications] = useState(true);
  const [dataSharing, setDataSharing] = useState(userData?.allowResearch || false);
  const [language, setLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(false);

  const handleNotificationToggle = () => {
    setNotifications(!notifications);
  };

  const handleDataSharingToggle = () => {
    const newValue = !dataSharing;
    setDataSharing(newValue);
    onDataUpdate({ allowResearch: newValue });
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 max-w-mobile mx-auto">
      {/* Header */}
      <div className="px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
      </div>

      {/* Profile Section */}
      <div className="px-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <span className="text-lg">👤</span>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">John Doe</h3>
              <p className="text-xs text-gray-600">john.doe@example.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Options */}
      <div className="px-4 space-y-3">
        {/* Data Sharing */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Research Participation</h3>
              <p className="text-sm text-gray-600">Share data for research</p>
            </div>
            <div
              onClick={handleDataSharingToggle}
              onKeyPress={(e) => handleKeyPress(e, handleDataSharingToggle)}
              tabIndex={0}
              role="switch"
              aria-checked={dataSharing}
              aria-label="Allow data sharing for research"
              className={`toggle-switch cursor-pointer ${dataSharing ? 'active' : ''}`}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-600">Get updates about earnings</p>
            </div>
            <div
              onClick={handleNotificationToggle}
              onKeyPress={(e) => handleKeyPress(e, handleNotificationToggle)}
              tabIndex={0}
              role="switch"
              aria-checked={notifications}
              aria-label="Enable notifications"
              className={`toggle-switch cursor-pointer ${notifications ? 'active' : ''}`}
            />
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Language</h3>
              <p className="text-sm text-gray-600">App language preference</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </div>

        {/* Dark Mode */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Dark Mode</h3>
              <p className="text-sm text-gray-600">Switch to dark theme</p>
            </div>
            <div
              onClick={() => setDarkMode(!darkMode)}
              onKeyPress={(e) => handleKeyPress(e, () => setDarkMode(!darkMode))}
              tabIndex={0}
              role="switch"
              aria-checked={darkMode}
              aria-label="Toggle dark mode"
              className={`toggle-switch cursor-pointer ${darkMode ? 'active' : ''}`}
            />
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-2">
          <button 
            onClick={() => onNavigate?.('consent-manager')}
            className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">🛡️</span>
              <div>
                <p className="font-medium text-gray-900">Consent Manager</p>
                <p className="text-sm text-gray-600">Per-file and per-scope consents</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => onNavigate?.('payouts')}
            className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">💳</span>
              <div>
                <p className="font-medium text-gray-900">Payouts</p>
                <p className="text-sm text-gray-600">KYC and payout methods</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => onNavigate?.('analytics')}
            className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">📈</span>
              <div>
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-600">Events and funnels</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => onNavigate?.('ai')}
            className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">🤖</span>
              <div>
                <p className="font-medium text-gray-900">AI Insights</p>
                <p className="text-sm text-gray-600">Ask about your files</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => onNavigate?.('trust-compliance')}
            className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">🛡️</span>
              <div>
                <p className="font-medium text-gray-900">Trust & Compliance</p>
                <p className="text-sm text-gray-600">Policies and security</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => onNavigate?.('pricing')}
            className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">🏷️</span>
              <div>
                <p className="font-medium text-gray-900">Pricing</p>
                <p className="text-sm text-gray-600">Doctor & Pharma</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => onNavigate?.('legal')}
            className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">📜</span>
              <div>
                <p className="font-medium text-gray-900">Legal</p>
                <p className="text-sm text-gray-600">ToS, Privacy, AUP</p>
              </div>
            </div>
          </button>
          <button 
            onClick={onViewAuditLog}
            className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">📋</span>
              <div>
                <p className="font-medium text-gray-900">Audit Log</p>
                <p className="text-sm text-gray-600">View all data access</p>
              </div>
            </div>
          </button>

          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-lg">📊</span>
              <div>
                <p className="font-medium text-gray-900">Export Data</p>
                <p className="text-sm text-gray-600">Download your data</p>
              </div>
            </div>
          </button>

          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-lg">❓</span>
              <div>
                <p className="font-medium text-gray-900">Help & Support</p>
                <p className="text-sm text-gray-600">Get help</p>
              </div>
            </div>
          </button>

          <button className="w-full text-left p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-lg">🚪</span>
              <div>
                <p className="font-medium text-red-900">Sign Out</p>
                <p className="text-sm text-red-600">Sign out of your account</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;