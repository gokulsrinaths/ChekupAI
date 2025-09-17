import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setIsInstalling(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Store dismissal in localStorage to prevent showing again for a while
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  // Check if banner was recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) { // Don't show for 7 days
        setShowBanner(false);
      }
    }
  }, []);

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 left-4 right-4 z-40"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">Install Chekup AI</h3>
              <p className="text-sm text-gray-600 mb-3">
                Get the full app experience on your device. Works offline and feels like a native app.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{isInstalling ? 'Installing...' : 'Install'}</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallBanner;
