import React, { useState, useEffect, useCallback } from 'react';
import { CROPS } from '../constants';
import type { Crop } from '../types';
import PriceChart from './PriceChart';
import { getMarketInsight } from '../services/geminiService';
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
  AlertIcon,
  BellIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ActivityIcon,
  DollarSignIcon
} from './icons';
import { 
  realtimeMarketService, 
  type RealTimeMarketPrice, 
  type MarketAlert, 
  type PriceComparison,
  type MarketAnalytics
} from '../services/realtimeMarketService';

interface MarketSummary {
  totalCommodities: number;
  avgPriceChange: number;
  topGainers: RealTimeMarketPrice[];
  topLosers: RealTimeMarketPrice[];
  highVolume: RealTimeMarketPrice[];
}

const RealTimeMarketDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<Crop>(CROPS[0]);
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [realtimePrices, setRealtimePrices] = useState<RealTimeMarketPrice[]>([]);
  const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [priceComparison, setPriceComparison] = useState<PriceComparison | null>(null);
  const [marketAnalytics, setMarketAnalytics] = useState<MarketAnalytics | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [historicalData, setHistoricalData] = useState<{ date: string; price: number; volume: number }[]>([]);
  const [showAlerts, setShowAlerts] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [timePeriod, setTimePeriod] = useState<'last30' | 'month' | 'year'>('last30');

  // Get period display text
  const getPeriodDisplayText = (period: 'last30' | 'month' | 'year'): string => {
    switch (period) {
      case 'last30':
        return 'Last 30 Days';
      case 'month':
        return `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`;
      case 'year':
        return `Year ${new Date().getFullYear()}`;
      default:
        return 'Last 30 Days';
    }
  };

  // Get data points text
  const getDataPointsText = (period: 'last30' | 'month' | 'year'): string => {
    switch (period) {
      case 'last30':
        return 'Daily data for the last 30 days';
      case 'month':
        return `Daily data for ${new Date().toLocaleString('default', { month: 'long' })}`;
      case 'year':
        return `Daily data for ${new Date().getFullYear()}`;
      default:
        return 'Daily data';
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const subscriberId = 'market-dashboard';
    
    realtimeMarketService.subscribe(subscriberId, (prices) => {
      setRealtimePrices(prices);
      setLastUpdate(new Date());
    });

    realtimeMarketService.subscribeToAlerts(subscriberId, (alert) => {
      setMarketAlerts(prev => [alert, ...prev]);
      // Show toast notification (you could implement toast here)
    });

    // Load initial data
    loadMarketData();

    return () => {
      realtimeMarketService.unsubscribe(subscriberId);
    };
  }, []);

  // Load market data
  const loadMarketData = useCallback(async () => {
    try {
      const [summary, comparison, analytics, historical] = await Promise.all([
        realtimeMarketService.getMarketSummary(),
        realtimeMarketService.getPriceComparison(selectedCrop.name),
        realtimeMarketService.getMarketAnalytics(selectedCrop.name, timePeriod),
        realtimeMarketService.getHistoricalData(selectedCrop.name, timePeriod)
      ]);

      setMarketSummary(summary);
      setPriceComparison(comparison);
      setMarketAnalytics(analytics);
      setHistoricalData(historical);
    } catch (error) {
      console.error('Failed to load market data:', error);
    }
  }, [selectedCrop.name, timePeriod]);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMarketData();
    setIsRefreshing(false);
  };

  // Get AI insight
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

  // Filter prices
  const filteredPrices = realtimePrices.filter(price => {
    const matchesSearch = price.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         price.market.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMarket = selectedMarket === 'all' || price.market.toLowerCase().includes(selectedMarket.toLowerCase());
    return matchesSearch && matchesMarket;
  });

  // Price change indicator component
  const PriceChangeIndicator: React.FC<{ change: number; showIcon?: boolean }> = ({ change, showIcon = true }) => (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
      change >= 0 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {showIcon && (change >= 0 ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />)}
      <span>{change >= 0 ? '+' : ''}{change}%</span>
    </div>
  );

  // Real-time price card
  const PriceCard: React.FC<{ price: RealTimeMarketPrice }> = ({ price }) => (
    <div className="bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{price.commodity}</h3>
          {price.variety && <span className="text-xs text-gray-500">({price.variety})</span>}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          price.trend === 'rising' ? 'bg-green-100 text-green-800' :
          price.trend === 'falling' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {price.trend}
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-blue-600">₹{price.price.toLocaleString()}</span>
          <span className="text-sm text-gray-500">/{price.unit}</span>
        </div>
        <PriceChangeIndicator change={price.priceChangePercent} />
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>{t('marketLabel')}</span>
          <span className="font-medium">{price.market}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('volumeLabel')}</span>
          <span className="font-medium">{price.volume} {price.unit}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('qualityLabel')}</span>
          <span className="font-medium">{price.quality}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('sourceLabel')}</span>
          <span className="font-medium">{price.source}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            <span>Updated {new Date(price.timestamp).toLocaleTimeString()}</span>
          </div>
          <span>{price.state}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('realtimeMarketDashboard')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('livePrices')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-black">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>{t('live')} • {t('updated')} {lastUpdate.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <BellIcon className="h-5 w-5" />
              {marketAlerts.filter(a => !a.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {marketAlerts.filter(a => !a.isRead).length}
                </span>
              )}
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </button>
          </div>
        </div>

        {/* Market Summary Stats */}
        {marketSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gray-100 rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChartIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('activeCommodities')}</p>
                  <p className="text-2xl font-bold text-gray-900">{marketSummary.totalCommodities}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  marketSummary.avgPriceChange >= 0 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  {marketSummary.avgPriceChange >= 0 ? (
                    <TrendingUpIcon className="h-6 w-6 text-green-600" />
                  ) : (
                    <TrendingDownIcon className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('avgPriceChange')}</p>
                  <p className={`text-2xl font-bold ${
                    marketSummary.avgPriceChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {marketSummary.avgPriceChange >= 0 ? '+' : ''}{marketSummary.avgPriceChange}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ActivityIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('highVolume')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketSummary.highVolume.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('activeAlerts')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketAlerts.filter(a => !a.isRead).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('viewPeriod')}</p>
                  <p className="text-sm font-bold text-gray-900">
                    {getPeriodDisplayText(timePeriod)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getDataPointsText(timePeriod)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Movers */}
        {marketSummary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-100 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5 text-green-600" />
                {t('topGainers')}
              </h3>
              <div className="space-y-3">
                {marketSummary.topGainers.map((price) => (
                  <div key={price.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{price.commodity}</p>
                      <p className="text-sm text-gray-600">{price.market}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{price.price}</p>
                      <PriceChangeIndicator change={price.priceChangePercent} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDownIcon className="h-5 w-5 text-red-600" />
                {t('topLosers')}
              </h3>
              <div className="space-y-3">
                {marketSummary.topLosers.map((price) => (
                  <div key={price.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{price.commodity}</p>
                      <p className="text-sm text-gray-600">{price.market}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{price.price}</p>
                      <PriceChangeIndicator change={price.priceChangePercent} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 relative">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchCommodities')} 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 text-gray-900"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">{t('period')}:</span>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as 'last30' | 'month' | 'year')}
                className="flex-1 sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 text-gray-900"
              >
                <option value="last30">{t('last30Days')}</option>
                <option value="month">{t('thisMonth')}</option>
                <option value="year">{t('thisYear')}</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">{t('marketFilter')}:</span>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="flex-1 sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 text-gray-900"
              >
                <option value="all">{t('allMarkets')}</option>
                <option value="delhi">Delhi</option>
                <option value="mumbai">Mumbai</option>
                <option value="pune">Pune</option>
                <option value="bangalore">Bangalore</option>
                <option value="nashik">Nashik</option>
              </select>
            </div>
            
            <button 
              onClick={handleGetInsight}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 whitespace-nowrap"
            >
              <InsightIcon className="h-4 w-4" />
              {t('aiInsight')}
            </button>
          </div>
        </div>

        {/* Real-time Price Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrices.map(price => (
            <PriceCard key={price.id} price={price} />
          ))}
        </div>

        {filteredPrices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('noCommoditiesFound')}</p>
          </div>
        )}

        {/* Price Comparison */}
        {priceComparison && (
          <div className="bg-gray-100 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('priceComparison')} - {priceComparison.commodity}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priceComparison.markets.map((market, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${
                  market.market === priceComparison.bestMarket
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                }`}>
                  <div className="font-medium text-gray-900">{market.market}</div>
                  <div className="text-xl font-bold text-blue-600">₹{market.price}</div>
                  {market.distance && <div className="text-sm text-gray-600">{t('distance')}: {market.distance}km</div>}
                  {market.transportCost && <div className="text-sm text-gray-600">{t('transport')}: ₹{market.transportCost}</div>}
                  {market.netPrice && <div className="text-sm font-medium text-green-600">{t('net')}: ₹{market.netPrice}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Analytics */}
        {marketAnalytics && (
          <div className="bg-gray-100 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('marketAnalytics')} - {marketAnalytics.commodity}
              </h3>
              <div className="text-sm text-gray-600">
                {t('period')}: {getPeriodDisplayText(timePeriod)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">{t('averagePrice')}</p>
                <p className="text-xl font-bold text-blue-600">₹{marketAnalytics.avgPrice}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">{t('highest')}</p>
                <p className="text-xl font-bold text-green-600">₹{marketAnalytics.highestPrice}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">{t('lowest')}</p>
                <p className="text-xl font-bold text-red-600">₹{marketAnalytics.lowestPrice}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">{t('volatility')}</p>
                <p className="text-xl font-bold text-purple-600">₹{marketAnalytics.volatility}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {t('pricePrediction')} ({timePeriod === 'year' ? t('nextMonth') : t('nextWeek')})
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>{t('predictedPrice')}</span>
                  <span className="font-bold text-blue-600">₹{marketAnalytics.prediction.nextWeekPrice}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span>{t('confidenceLevel')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${marketAnalytics.prediction.confidence}%` }}
                      ></div>
                    </div>
                    <span className="font-medium">{marketAnalytics.prediction.confidence}%</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">{t('keyFactors')}:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {marketAnalytics.prediction.factors.map((factor, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Pattern Analysis */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-3">
                {timePeriod === 'year' ? t('monthlyPattern') : 
                 timePeriod === 'month' ? t('weekly') : 
                 t('recent')} {t('pricePattern')}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {marketAnalytics.seasonalPattern.map((pattern, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600">{pattern.month}</p>
                    <p className="font-bold text-gray-900">₹{Math.round(pattern.avgPrice)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Historical Chart */}
        {historicalData.length > 0 && (
          <div className="bg-gray-100 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('priceTrend')} - {getPeriodDisplayText(timePeriod)}
              </h3>
              <div className="text-sm text-gray-600">
                {t('dataPoints')} {historicalData.length}
              </div>
            </div>
            <div className="h-80">
              {(() => {
                // Prepare data based on selected period
                if (timePeriod === 'year') {
                  // Group by month and compute average price
                  const byMonth: Record<string, { sum: number; count: number }> = {};
                  for (const d of historicalData) {
                    const [y, m] = d.date.split('-');
                    const key = `${y}-${m}`;
                    if (!byMonth[key]) byMonth[key] = { sum: 0, count: 0 };
                    byMonth[key].sum += d.price; byMonth[key].count += 1;
                  }
                  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  const monthSeries = Object.keys(byMonth).sort().map(k => {
                    const monthIdx = parseInt(k.split('-')[1], 10) - 1;
                    return { month: monthNames[monthIdx], price: Math.round(byMonth[k].sum / byMonth[k].count) };
                  });
                  return <PriceChart data={monthSeries} xKey="month" />;
                }
                if (timePeriod === 'month') {
                  // Use date granularity but only current month data
                  const monthData = historicalData.map(d => ({ date: d.date, price: d.price }));
                  return <PriceChart data={monthData} xKey="date" />;
                }
                // last30 default: date granularity
                const last30 = historicalData.map(d => ({ date: d.date, price: d.price }));
                return <PriceChart data={last30} xKey="date" />;
              })()}
            </div>
          </div>
        )}

        {/* Alerts Panel */}
        {showAlerts && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-100 rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">{t('marketAlerts')}</h3>
                  <button
                    onClick={() => setShowAlerts(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {marketAlerts.length === 0 ? (
                  <p className="text-gray-500">{t('noAlertsYet')}</p>
                ) : (
                  marketAlerts.map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg ${
                      alert.priority === 'high' ? 'bg-red-50 border border-red-200' :
                      alert.priority === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{alert.commodity}</p>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!alert.isRead && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Insight Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={t('aiMarketInsight')}
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{insight}</p>
              {insight && (
                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                  <p className="text-sm text-blue-700">
                    {t('aiInsightRealtime')}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default RealTimeMarketDashboard;
