import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-40 mt-16">
      <div className="glass elev-2 px-3 py-2 rounded-full flex items-center space-x-2 text-sm text-gray-800 border border-white/40">
        <WifiOff className="w-4 h-4" />
        <span>Offline mode — changes will sync when online</span>
      </div>
    </div>
  );
};

export default OfflineBanner;


