import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, X } from 'lucide-react';

const TrustPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Trust & Policy</h2>
              <p className="text-sm text-gray-500">Your data, your power</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Data Storage */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Lock className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">We don't store raw files</h3>
              <p className="text-sm text-gray-600">
                Your original medical files never leave your device. We only work with anonymized, 
                de-identified data for research purposes.
              </p>
            </div>
          </div>

          {/* Consent-driven */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Eye className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Consent-driven cloning</h3>
              <p className="text-sm text-gray-600">
                All data sharing requires your explicit consent. You can revoke access at any time, 
                and all access is recorded in your audit log.
              </p>
            </div>
          </div>

          {/* HIPAA Compliance */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">HIPAA Safe Harbor de-ID</h3>
              <p className="text-sm text-gray-600">
                All data is processed using HIPAA Safe Harbor standards for de-identification, 
                ensuring your privacy is protected.
              </p>
            </div>
          </div>

          {/* Audit Log */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Complete Audit Trail</h4>
            <p className="text-sm text-gray-600">
              Every access to your data is logged with timestamps, actors, and actions. 
              View your complete audit log in Settings.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TrustPolicyModal;
