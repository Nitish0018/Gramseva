
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent border-solid rounded-full animate-spin"></div>
      <p className="ml-3 text-textSecondary">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
