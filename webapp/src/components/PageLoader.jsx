import React from 'react';

function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated logo */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 animate-pulse"></div>
          <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
            <span className="text-3xl animate-bounce">🌍</span>
          </div>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-loading-bar"></div>
        </div>

        <p className="mt-4 text-gray-500 text-sm animate-pulse">Loading amazing experiences...</p>
      </div>
    </div>
  );
}

export default PageLoader;
