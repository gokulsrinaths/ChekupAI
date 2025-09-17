import React from 'react';
import { motion } from 'framer-motion';
import { Home, FolderClosed, Wallet2, Settings, Microscope, Pill, Users, Upload, MessageCircle, Award } from 'lucide-react';

const BottomNavigation = ({ currentScreen, onScreenChange, currentRole = 'patient' }) => {
  const getNavItems = () => {
  const baseItems = [
    { id: 'dashboard', label: 'Home', icon: Home, screen: 'dashboard' },
    { id: 'family', label: 'Family', icon: Users, screen: 'family' },
    { id: 'upload', label: 'Upload', icon: Upload, screen: 'upload' },
    { id: 'points', label: 'Points', icon: Award, screen: 'points' },
    { id: 'settings', label: 'Settings', icon: Settings, screen: 'settings' }
  ];

    if (currentRole === 'doctor') {
      return [
        { id: 'doctor', label: 'Research', icon: Microscope, screen: 'doctor' },
        { id: 'wallet', label: 'Wallet', icon: Wallet2, screen: 'wallet' },
        { id: 'settings', label: 'Settings', icon: Settings, screen: 'settings' }
      ];
    }

    if (currentRole === 'pharma') {
      return [
        { id: 'pharma', label: 'Marketplace', icon: Pill, screen: 'pharma' },
        { id: 'wallet', label: 'Wallet', icon: Wallet2, screen: 'wallet' },
        { id: 'settings', label: 'Settings', icon: Settings, screen: 'settings' }
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <div
      className="bottom-nav bg-white border-t border-gray-200 shadow-lg"
      style={{ 
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => {
          const isActive = currentScreen === item.screen;
          
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.screen)}
              className={`flex flex-col items-center justify-center py-3 px-5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div 
        className="h-2" 
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      />
    </div>
  );
};

export default BottomNavigation;
