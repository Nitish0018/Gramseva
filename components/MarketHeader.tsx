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
    <div className="sticky top-0 z-40 glass border-b border-white/20">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-display tracking-tight text-gradient">
            {t('appName')}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-textSecondary hidden sm:block">{t('viewLabel')}</span>
            <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-200/50 backdrop-blur-sm">
              <button
                onClick={() => setUseRealtimeDashboard(false)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ${!useRealtimeDashboard
                    ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                    : 'text-textSecondary hover:text-textPrimary'
                  }`}
              >
                {t('standardView')}
              </button>
              <button
                onClick={() => setUseRealtimeDashboard(true)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ${useRealtimeDashboard
                    ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                    : 'text-textSecondary hover:text-textPrimary'
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