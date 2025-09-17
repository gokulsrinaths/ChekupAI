import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const SkeletonCard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
    >
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
        </div>
      </div>
    </motion.div>
  );

  const SkeletonList = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  if (type === 'list') {
    return <SkeletonList />;
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
