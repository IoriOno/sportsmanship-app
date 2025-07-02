import React from 'react';
import { ENVIRONMENT } from '../../config/api';

const EnvironmentIndicator: React.FC = () => {
  // 本番環境では表示しない
  if (ENVIRONMENT.isProduction && !window.location.hostname.includes('localhost')) {
    return null;
  }

  const getEnvColor = () => {
    switch (ENVIRONMENT.currentEnv) {
      case 'production':
        return 'bg-red-600';
      case 'development':
        return 'bg-green-600';
      case 'test':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getEnvEmoji = () => {
    switch (ENVIRONMENT.currentEnv) {
      case 'production':
        return '🚀';
      case 'development':
        return '🔧';
      case 'test':
        return '🧪';
      default:
        return '❓';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 ${getEnvColor()} text-white p-3 rounded-lg shadow-lg text-xs font-mono`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg">{getEnvEmoji()}</span>
        <div>
          <div className="font-bold">Environment: {ENVIRONMENT.currentEnv}</div>
          <div className="opacity-90">API: {ENVIRONMENT.apiUrl}</div>
          <div className="opacity-75 text-xxs">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentIndicator;