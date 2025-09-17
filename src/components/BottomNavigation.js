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
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl z-50"
      style={{ 
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12)',
      }}
    >
      <div className="flex items-center justify-around py-4 px-6">
        {navItems.map((item, index) => {
          const isActive = currentScreen === item.screen;
          
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onScreenChange(item.screen)}
              className={`flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'text-blue-600 bg-blue-50/80 shadow-md' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
              }`}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon className="w-6 h-6 mb-1" />
              </motion.div>
              <span className={`text-xs font-medium transition-all duration-300 ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Perfect safe area for devices with home indicator */}
      <div 
        className="h-3 bg-gradient-to-t from-white/95 to-transparent" 
        style={{ 
          backdropFilter: 'blur(10px)'
        }}
      />
    </motion.div>
  );
};

export default BottomNavigation;
