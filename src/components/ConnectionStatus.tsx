import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';

interface ConnectionStatusProps {
  connected: boolean;
  onRetry: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connected, onRetry }) => {
  // Only show the component when there's a connection issue
  if (connected) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
        <XCircleIcon className="h-5 w-5 text-red-400 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Gemini API Not Connected
          </h3>
          <p className="text-sm text-red-700">
            {process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost'
              ? 'Please ensure your Gemini API key is set in Vercel environment variables (GEMINI_API_KEY)'
              : 'Please ensure your Gemini API key is set in .env.local (REACT_APP_GEMINI_API_KEY)'
            }
          </p>
        </div>
        <button
          onClick={onRetry}
          className="ml-4 px-3 py-1 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus; 