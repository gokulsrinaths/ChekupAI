import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronDown } from 'lucide-react';

const TopBar = ({ currentRole, onRoleChange, onInfoClick }) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const roles = [
    { id: 'patient', label: 'Patient', icon: '👤' },
    { id: 'doctor', label: 'Doctor', icon: '👨‍⚕️' },
    { id: 'pharma', label: 'Pharma', icon: '💊' }
  ];

  const currentRoleData = roles.find(role => role.id === currentRole) || roles[0];

  return (
    <div className="top-bar glass elev-2 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center brand-gradient text-white font-bold text-sm">C</div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Chekup AI</h1>
          <p className="text-xs text-gray-500">Investor Demo</p>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-3">
        {/* Role Switch */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors hit-lg"
          >
            <span className="text-sm">{currentRoleData.icon}</span>
            <span className="text-sm font-medium text-gray-700">{currentRoleData.label}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          <AnimatePresence>
            {showRoleDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      onRoleChange(role.id);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      currentRole === role.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-sm">{role.icon}</span>
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Button */}
        <button
          onClick={onInfoClick}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors hit-lg"
          aria-label="Trust & Policy Information"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
