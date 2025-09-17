import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Shield, Package, X, Database } from 'lucide-react';

const PackagingModal = ({ isOpen, onClose, datasetName, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    {
      id: 'deidentify',
      title: 'De-identify',
      description: 'Removing all personal identifiers',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      id: 'normalize',
      title: 'Normalize',
      description: 'Standardizing data formats',
      icon: Database,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'package',
      title: 'Package',
      description: 'Creating secure dataset package',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  useEffect(() => {
    if (isOpen && !isProcessing) {
      setIsProcessing(true);
      runPackagingSequence();
    }
  }, [isOpen]);

  const runPackagingSequence = async () => {
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 650)); // 650ms per step
    }
    
    // Complete
    await new Promise(resolve => setTimeout(resolve, 500));
    onComplete?.();
  };

  const handleClose = () => {
    setCurrentStep(0);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onKeyDown={(e) => { if (e.key === 'Escape') handleClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Processing Dataset</h2>
            <p className="text-sm text-gray-500">{datasetName}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4 mb-6">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  isActive ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-100' : isActive ? step.bgColor : 'bg-gray-200'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? step.color : 'text-gray-400'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>
                {isActive && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Processing Message */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <p className="text-sm text-gray-600">
              {currentStep < steps.length 
                ? `Processing: ${steps[currentStep].title}...`
                : 'Finalizing dataset...'
              }
            </p>
          </motion.div>
        )}

        {/* Completion Message */}
        {currentStep >= steps.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dataset Ready!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your dataset has been processed and is ready for download. 
              Invoice has been sent to the buyer.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> We don't store raw files. All data is processed 
                using HIPAA Safe Harbor de-identification standards.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Complete
            </button>
          </motion.div>
        )}

        {/* Cancel Button (only show during processing) */}
        {isProcessing && currentStep < steps.length && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PackagingModal;
