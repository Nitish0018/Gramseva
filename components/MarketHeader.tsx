import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface MarketHeaderProps {
  useRealtimeDashboard: boolean;
  setUseRealtimeDashboard: (value: boolean) => void;
}

const MarketHeader: React.FC<MarketHeaderProps> = ({
  useRealtimeDashboard,
  setUseRealtimeDashboard
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('appName')}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{t('viewLabel')}</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setUseRealtimeDashboard(false)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  !useRealtimeDashboard
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                {t('standardView')}
              </button>
              <button
                onClick={() => setUseRealtimeDashboard(true)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  useRealtimeDashboard
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                {t('realtimeView')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketHeader;