import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, ChevronDown, User, Stethoscope, Pill } from 'lucide-react';

const DemoMode = ({ 
  currentRole, 
  onRoleChange, 
  onScreenChange, 
  onDataUpdate, 
  onResetDemo,
  onRunDemoScript 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunningScript, setIsRunningScript] = useState(false);

  const roles = [
    { id: 'patient', label: 'Patient', icon: User, color: 'text-blue-600' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'text-green-600' },
    { id: 'pharma', label: 'Pharma', icon: Pill, color: 'text-purple-600' }
  ];

  const handleRoleQuickSwitch = (roleId) => {
    onRoleChange(roleId);
    setIsOpen(false);
  };

  const handleRunDemoScript = async () => {
    setIsRunningScript(true);
    await onRunDemoScript();
    setIsRunningScript(false);
    setIsOpen(false);
  };

  const handleResetDemo = () => {
    onResetDemo();
    setIsOpen(false);
  };

  return (
    <>
      {/* Demo Mode Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-30 bg-blue-600 text-white px-3 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <Play className="w-4 h-4" />
          <span className="text-sm font-medium">Demo</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </motion.button>

      {/* Demo Mode Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-16 right-4 z-30 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-64"
          >
            <div className="space-y-4">
              {/* Current Role */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Current Role</h3>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  {(() => {
                    const currentRoleData = roles.find(role => role.id === currentRole);
                    const Icon = currentRoleData?.icon || User;
                    return (
                      <>
                        <Icon className={`w-4 h-4 ${currentRoleData?.color || 'text-gray-600'}`} />
                        <span className="text-sm font-medium text-gray-700">
                          {currentRoleData?.label || 'Patient'}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Quick Role Switch */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Switch</h3>
                <div className="space-y-1">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => handleRoleQuickSwitch(role.id)}
                        className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-colors ${
                          currentRole === role.id 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${role.color}`} />
                        <span className="text-sm font-medium">{role.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Demo Actions */}
              <div className="pt-2 border-t border-gray-200">
                <div className="space-y-2">
                  <button
                    onClick={handleRunDemoScript}
                    disabled={isRunningScript}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>{isRunningScript ? 'Running...' : 'Run Demo Script'}</span>
                  </button>
                  
                  <button
                    onClick={handleResetDemo}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Demo</span>
                  </button>
                </div>
              </div>

              {/* Demo Script Steps */}
              <div className="pt-2 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-900 mb-2">Demo Script Steps:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>1. Toggle consent → Show receipt</p>
                  <p>2. Switch to Doctor → View case</p>
                  <p>3. Switch to Pharma → Request dataset</p>
                  <p>4. Back to Patient → Check wallet</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DemoMode;
