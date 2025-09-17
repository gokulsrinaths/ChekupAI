import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, Shield, RotateCcw, X } from 'lucide-react';

const ConsentReceiptModal = ({ isOpen, onClose, receiptData }) => {
  if (!isOpen) return null;

  const generateReceiptId = () => {
    return 'CR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const receipt = {
    id: receiptData?.id || generateReceiptId(),
    timestamp: receiptData?.timestamp || new Date().toISOString(),
    scope: 'Research (de-identified only)',
    deIdMethod: 'HIPAA Safe Harbor',
    revocation: 'Future access only; past uses remain in audit log'
  };

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
        className="bg-white rounded-2xl p-6 max-w-md w-full"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Consent Receipt</h2>
              <p className="text-sm text-gray-500">Your consent has been recorded</p>
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

        {/* Receipt Content */}
        <div className="space-y-4">
          {/* Receipt ID */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Receipt ID</span>
              <span className="text-sm font-mono text-gray-900">{receipt.id}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{new Date(receipt.timestamp).toLocaleString()}</span>
            </div>
          </div>

          {/* Scope */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Scope</h3>
              <p className="text-sm text-gray-600">{receipt.scope}</p>
            </div>
          </div>

          {/* De-identification */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Shield className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">De-identification</h3>
              <p className="text-sm text-gray-600">{receipt.deIdMethod}</p>
            </div>
          </div>

          {/* Revocation */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <RotateCcw className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Revocation</h3>
              <p className="text-sm text-gray-600">{receipt.revocation}</p>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Legal Notice:</strong> This receipt serves as proof of your consent. 
              All data access is logged and auditable. You can revoke consent at any time.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            Consent Saved
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConsentReceiptModal;
