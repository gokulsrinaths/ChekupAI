import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
        return 'bg-trust-blue text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl max-w-sm w-full mx-4 ${getToastStyles()}`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-xl">{getIcon()}</span>
        <p className="font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-auto text-white/80 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <AnimatePresence>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </AnimatePresence>
  );
};

export default Toast;
