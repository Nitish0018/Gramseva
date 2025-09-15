
import React, { useState, useEffect } from 'react';
import { CROPS } from '../constants';
import type { Crop } from '../types';
import PriceChart from './PriceChart';
import { getMarketInsight } from '../services/geminiService';
import { marketApi, type MarketPrice, type WeatherData } from '../services/backendService';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  SearchIcon, 
  InsightIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  RefreshIcon, 
  FilterIcon,
  BarChartIcon,
  MapPinIcon,
  ClockIcon,
  AlertIcon
} from './icons';

const MarketDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<Crop>(CROPS[0]);
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [granularity, setGranularity] = useState<'date' | 'month' | 'year'>('month');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadMarketData();
    loadWeatherData();
  }, []);

  const loadMarketData = async () => {
    try {
      const response = await marketApi.getPrices();
      if (response.success && response.data) {
        setMarketPrices(response.data);
      }
    } catch (error) {
      console.error('Failed to load market data:', error);
    }
  };

  const loadWeatherData = async () => {
    try {
      const response = await marketApi.getWeather('delhi'); // Default location
      if (response.success && response.data) {
        setWeather(response.data);
      }
    } catch (error) {
      console.error('Failed to load weather data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadMarketData(), loadWeatherData()]);
    setIsRefreshing(false);
  };

  const handleGetInsight = async () => {
    setIsLoading(true);
    setIsModalOpen(true);
    try {
      const result = await getMarketInsight(selectedCrop.name);
      setInsight(result);
    } catch (error) {
      setInsight('Failed to get AI insight. Please try again later.');
    }
    setIsLoading(false);
  };

  const filteredCrops = CROPS.filter(crop => 
    crop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PriceChangeIndicator: React.FC<{ change: number }> = ({ change }) => (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
      change >= 0 
        ? 'bg-success/10 text-success' 
        : 'bg-error/10 text-error'
    }`}>
      {change >= 0 ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
      <span>{Math.abs(change)}%</span>
    </div>
  );

  const WeatherWidget = () => weather && (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-primary" />
          {t('weather')} - {weather.location}
        </h3>
        <span className="text-2xl font-bold text-primary">{weather.temperature}°C</span>
      </div>
      <p className="text-textSecondary mb-3">{weather.description}</p>
      <div className="text-sm text-textSecondary">
        {t('humidity')}: {weather.humidity}%
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">{t('marketDashboard')}</h1>
          <p className="text-textSecondary mt-1">{t('realtimePrices')}</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RefreshIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BarChartIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">{t('activeMarkets')}</p>
              <p className="text-2xl font-bold text-textPrimary">{marketPrices.length || 12}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/10 rounded-lg">
              <ArrowUpIcon className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">{t('priceIncreases')}</p>
              <p className="text-2xl font-bold text-success">8</p>
            </div>
          </div>
        </div>

        <WeatherWidget />
      </div>
      
      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchCrops')} 
            className="input pl-10"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon />
          </div>
        </div>
        <button className="btn btn-secondary flex items-center gap-2">
          <FilterIcon className="h-4 w-4" />
          {t('filter')}
        </button>
      </div>

      {/* Crop Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCrops.map(crop => (
          <div 
            key={crop.id}
            onClick={() => setSelectedCrop(crop)}
            className={`card cursor-pointer transition-all duration-300 hover:shadow-medium ${
              selectedCrop.id === crop.id 
                ? 'ring-2 ring-primary bg-primary/5 scale-105' 
                : 'hover:scale-102'
            }`}
          >
            <div className="text-center space-y-3">
              <div className="mx-auto">
                {crop.iconImage ? (
                  <img src={crop.iconImage} alt={`${crop.name} icon`} className="h-12 w-12 object-contain mx-auto" />
                ) : (
                  <span className="text-4xl">{crop.icon}</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-textPrimary">{crop.name}</p>
                <p className="text-lg font-bold text-primary">₹{crop.currentPrice}</p>
                <p className="text-xs text-textSecondary">{t('perQuintal')}</p>
                <div className="mt-2 flex justify-center">
                  <PriceChangeIndicator change={crop.priceChange} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Crop Analysis */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-textPrimary flex items-center gap-3">
              {selectedCrop.iconImage ? (
                <img src={selectedCrop.iconImage} alt={`${selectedCrop.name} icon`} className="h-8 w-8 object-contain" />
              ) : (
                <span className="text-3xl">{selectedCrop.icon}</span>
              )}
              {selectedCrop.name} {t('analysis')}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-xl font-semibold text-primary">₹{selectedCrop.currentPrice}/Quintal</p>
              <PriceChangeIndicator change={selectedCrop.priceChange} />
              <div className="flex items-center gap-1 text-textSecondary text-sm">
                <ClockIcon className="h-4 w-4" />
                <span>{t('updatedAgo')}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <label className="text-sm text-textSecondary">{t('view')}</label>
              <select
                className="input"
                value={granularity}
                onChange={(e) => setGranularity(e.target.value as 'date' | 'month' | 'year')}
              >
                <option value="date">{t('daily')}</option>
                <option value="month">{t('monthly')}</option>
                <option value="year">{t('yearly')}</option>
              </select>
            </div>
            <button 
              onClick={handleGetInsight}
              className="btn btn-primary flex items-center gap-2"
            >
              <InsightIcon className="h-4 w-4" />
              {t('getAiInsight')}
            </button>
          </div>
        </div>
        
        <ChartSection selectedCrop={selectedCrop} granularity={granularity} />

        {/* Market Alerts */}
        <div className="mt-6 p-4 bg-warning/10 border-l-4 border-warning rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertIcon className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <h4 className="font-semibold text-warning">{t('marketAlert')}</h4>
              <p className="text-sm text-textSecondary mt-1">
                {selectedCrop.name} prices have increased by {selectedCrop.priceChange}% in the last week. 
                Consider adjusting your selling strategy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`${t('aiMarketInsight')} for ${selectedCrop.name}`}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-textSecondary whitespace-pre-wrap leading-relaxed">{insight}</p>
            {insight && (
              <div className="mt-4 p-3 bg-info/10 border-l-4 border-info rounded-r-lg">
                <p className="text-sm text-info">
                  {t('aiInsightNote')}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// Helper: chart section renderer with data shaping
function ChartSection({ selectedCrop, granularity }: { selectedCrop: Crop; granularity: 'date' | 'month' | 'year' }) {
  // Base monthly data from constants: [{ month: 'Jan', price: number }]
  const monthly = selectedCrop.historicalData;

  // Build yearly series (group months by an assumed year). Since sample data lacks year, synthesize year using current year.
  const currentYear = new Date().getFullYear();
  const yearlyData = [
    { year: currentYear - 1, price: Math.round(monthly.slice(0, 3).reduce((a, b) => a + b.price, 0) / Math.max(1, Math.min(3, monthly.length))) },
    { year: currentYear, price: Math.round(monthly.reduce((a, b) => a + b.price, 0) / Math.max(1, monthly.length)) },
  ];

  // Build daily data by generating actual daily points from current date backwards
  const dailyData: Array<{ date: string; price: number }> = [];
  const today = new Date();
  const basePrice = selectedCrop.currentPrice;
  const days = 30; // Last 30 days
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - i)); // Go from 30 days ago to today
    
    // Generate realistic price variations with some trending
    const daysSinceStart = i;
    const trendFactor = (daysSinceStart / days) * selectedCrop.priceChange * 0.01; // Apply overall trend
    const randomVariation = (Math.random() - 0.5) * (basePrice * 0.05); // ±5% random daily variation
    const price = Math.round(basePrice * (1 + trendFactor) + randomVariation);
    
    dailyData.push({ 
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      price: Math.max(100, price) // Ensure minimum price
    });
  }

  const chartData = granularity === 'date' 
    ? dailyData 
    : granularity === 'month' 
      ? monthly 
      : yearlyData;

  const xKey = granularity;

  return (
    <div className="h-80">
      <PriceChart data={chartData} xKey={xKey} />
    </div>
  );
}

export default MarketDashboard;
