import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen = () => {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-trust-blue to-accent-blue flex items-center justify-center"
      role="banner"
      aria-label="Chekup AI loading screen"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="text-center text-white"
      >
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          className="text-5xl font-bold mb-4 tracking-tight"
          aria-label="Chekup AI"
        >
          Chekup AI
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
          className="text-xl font-light opacity-90"
          aria-label="Your Data. Your Power."
        >
          Your Data. Your Power.
        </motion.p>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5, ease: 'easeOut' }}
          className="mt-12"
          role="progressbar"
          aria-label="Loading progress"
        >
          <div className="w-16 h-1 bg-white/30 rounded-full mx-auto">
            <motion.div
              className="w-16 h-1 bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 1.5, duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
