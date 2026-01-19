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
    <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${change >= 0
        ? 'bg-success/10 text-success'
        : 'bg-error/10 text-error'
      }`}>
      {showIcon && (change >= 0 ? <ArrowUpIcon className="h-3.5 w-3.5 stroke-[3]" /> : <ArrowDownIcon className="h-3.5 w-3.5 stroke-[3]" />)}
      <span>{change >= 0 ? '+' : ''}{change}%</span>
    </div>
  );

  // Real-time price card
  const PriceCard: React.FC<{ price: RealTimeMarketPrice }> = ({ price }) => (
    <div className="card card-hover group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${price.trend === 'rising' ? 'bg-success' :
          price.trend === 'falling' ? 'bg-error' : 'bg-gray-300'
        }`} />

      <div className="flex items-center justify-between mb-3 pl-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">{price.commodity}</h3>
          {price.variety && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{price.variety}</span>}
        </div>
        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${price.trend === 'rising' ? 'bg-success/10 text-success' :
            price.trend === 'falling' ? 'bg-error/10 text-error' :
              'bg-gray-100 text-gray-600'
          }`}>
          {price.trend}
        </div>
      </div>

      <div className="mb-4 pl-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900 tracking-tight">₹{price.price.toLocaleString()}</span>
          <span className="text-sm font-medium text-gray-500">/{price.unit}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <PriceChangeIndicator change={price.priceChangePercent} />
          <span className="text-xs text-gray-400">vs yesterday</span>
        </div>
      </div>

      <div className="space-y-2 text-sm pl-3">
        <div className="flex justify-between items-center py-1 border-b border-gray-50">
          <span className="text-gray-500">{t('marketLabel')}</span>
          <span className="font-medium text-gray-900">{price.market}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-gray-50">
          <span className="text-gray-500">{t('volumeLabel')}</span>
          <span className="font-medium text-gray-900">{price.volume} {price.unit}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-gray-500">{t('qualityLabel')}</span>
          <span className="font-medium text-gray-900">{price.quality}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 pl-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
            <ClockIcon className="h-3 w-3" />
            <span>Updated {new Date(price.timestamp).toLocaleTimeString()}</span>
          </div>
          <span className="font-medium text-primary">{price.state}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent pb-10">
      <div className="container-page space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-enter">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 font-display tracking-tight">
              {t('realtimeMarketDashboard')}
            </h1>
            <p className="text-textSecondary mt-2 text-lg">
              {t('livePrices')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 bg-primary/5 text-primary rounded-full border border-primary/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span>{t('live')} • {t('updated')} {lastUpdate.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2.5 bg-white text-gray-600 hover:text-primary hover:bg-gray-50 rounded-xl border border-gray-200 transition-all active:scale-95"
            >
              <BellIcon className="h-5 w-5" />
              {marketAlerts.filter(a => !a.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {marketAlerts.filter(a => !a.isRead).length}
                </span>
              )}
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn btn-primary flex items-center gap-2"
            >
              <RefreshIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </button>
          </div>
        </div>

        {/* Market Summary Stats */}
        {marketSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-enter" style={{ animationDelay: '0.1s' }}>
            <div className="card p-5 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <BarChartIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('activeCommodities')}</p>
                  <p className="text-2xl font-bold text-gray-900">{marketSummary.totalCommodities}</p>
                </div>
              </div>
            </div>

            <div className={`card p-5 border-l-4 ${marketSummary.avgPriceChange >= 0 ? 'border-l-success' : 'border-l-error'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${marketSummary.avgPriceChange >= 0
                    ? 'bg-success/10'
                    : 'bg-error/10'
                  }`}>
                  {marketSummary.avgPriceChange >= 0 ? (
                    <TrendingUpIcon className="h-6 w-6 text-success" />
                  ) : (
                    <TrendingDownIcon className="h-6 w-6 text-error" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('avgPriceChange')}</p>
                  <p className={`text-2xl font-bold ${marketSummary.avgPriceChange >= 0 ? 'text-success' : 'text-error'
                    }`}>
                    {marketSummary.avgPriceChange >= 0 ? '+' : ''}{marketSummary.avgPriceChange}%
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-5 border-l-4 border-l-purple-500">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <ActivityIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('highVolume')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketSummary.highVolume.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-5 border-l-4 border-l-orange-500">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <AlertIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('activeAlerts')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketAlerts.filter(a => !a.isRead).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-5 border-l-4 border-l-indigo-500">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                  <ClockIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{getPeriodDisplayText(timePeriod)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t('viewPeriod')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Movers */}
        {marketSummary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-enter" style={{ animationDelay: '0.2s' }}>
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <div className="p-1.5 bg-success/10 rounded-lg">
                  <TrendingUpIcon className="h-5 w-5 text-success" />
                </div>
                {t('topGainers')}
              </h3>
              <div className="space-y-3">
                {marketSummary.topGainers.map((price) => (
                  <div key={price.id} className="flex items-center justify-between p-3.5 bg-success/5 rounded-xl border border-success/10 hover:bg-success/10 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-900">{price.commodity}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{price.market}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{price.price}</p>
                      <PriceChangeIndicator change={price.priceChangePercent} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <div className="p-1.5 bg-error/10 rounded-lg">
                  <TrendingDownIcon className="h-5 w-5 text-error" />
                </div>
                {t('topLosers')}
              </h3>
              <div className="space-y-3">
                {marketSummary.topLosers.map((price) => (
                  <div key={price.id} className="flex items-center justify-between p-3.5 bg-error/5 rounded-xl border border-error/10 hover:bg-error/10 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-900">{price.commodity}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{price.market}</p>
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
        <div className="flex flex-col gap-4 animate-enter" style={{ animationDelay: '0.3s' }}>
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchCommodities')}
              className="input pl-11 py-3 text-lg shadow-sm"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 p-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{t('period')}:</span>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as 'last30' | 'month' | 'year')}
                className="flex-1 sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer text-gray-700 shadow-sm"
              >
                <option value="last30">{t('last30Days')}</option>
                <option value="month">{t('thisMonth')}</option>
                <option value="year">{t('thisYear')}</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{t('marketFilter')}:</span>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="flex-1 sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer text-gray-700 shadow-sm"
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
              className="ml-auto flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transition-all active:scale-95 whitespace-nowrap font-medium"
            >
              <InsightIcon className="h-4 w-4" />
              {t('aiInsight')}
            </button>
          </div>
        </div>

        {/* Real-time Price Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-enter" style={{ animationDelay: '0.4s' }}>
          {filteredPrices.map(price => (
            <PriceCard key={price.id} price={price} />
          ))}
        </div>

        {filteredPrices.length === 0 && (
          <div className="text-center py-20 bg-white/50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-lg font-medium">{t('noCommoditiesFound')}</p>
          </div>
        )}

        {/* Price Comparison */}
        {priceComparison && (
          <div className="card p-8 animate-enter" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-blue-500 rounded-full"></span>
              {t('priceComparison')} - {priceComparison.commodity}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {priceComparison.markets.map((market, index) => (
                <div key={index} className={`relative p-5 rounded-2xl border-2 transition-all ${market.market === priceComparison.bestMarket
                    ? 'border-success bg-success/5 shadow-md'
                    : 'border-gray-100 hover:border-gray-200'
                  }`}>
                  {market.market === priceComparison.bestMarket && (
                    <div className="absolute -top-3 left-4 px-3 py-1 bg-success text-white text-xs font-bold rounded-full shadow-sm">
                      BEST PRICE
                    </div>
                  )}
                  <div className="font-bold text-gray-900 text-lg">{market.market}</div>
                  <div className="text-2xl font-bold text-primary my-2">₹{market.price}</div>
                  <div className="space-y-1">
                    {market.distance && <div className="text-sm text-gray-500">{t('distance')}: <span className="text-gray-700">{market.distance}km</span></div>}
                    {market.transportCost && <div className="text-sm text-gray-500">{t('transport')}: <span className="text-gray-700">₹{market.transportCost}</span></div>}
                    {market.netPrice && <div className="text-sm font-bold text-success border-t border-gray-100 mt-2 pt-2">{t('net')}: ₹{market.netPrice}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Analytics */}
        {marketAnalytics && (
          <div className="card p-8 animate-enter" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-1 h-8 bg-purple-500 rounded-full"></span>
                {t('marketAnalytics')} - {marketAnalytics.commodity}
              </h3>
              <div className="text-sm font-medium px-4 py-1.5 bg-gray-100 rounded-full text-gray-600">
                {t('period')}: {getPeriodDisplayText(timePeriod)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-1">{t('averagePrice')}</p>
                <p className="text-2xl font-bold text-primary">₹{marketAnalytics.avgPrice}</p>
              </div>
              <div className="text-center p-4 bg-green-50/50 rounded-2xl border border-green-100">
                <p className="text-sm text-green-700 font-medium mb-1">{t('highest')}</p>
                <p className="text-2xl font-bold text-green-700">₹{marketAnalytics.highestPrice}</p>
              </div>
              <div className="text-center p-4 bg-red-50/50 rounded-2xl border border-red-100">
                <p className="text-sm text-red-700 font-medium mb-1">{t('lowest')}</p>
                <p className="text-2xl font-bold text-red-700">₹{marketAnalytics.lowestPrice}</p>
              </div>
              <div className="text-center p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                <p className="text-sm text-purple-700 font-medium mb-1">{t('volatility')}</p>
                <p className="text-2xl font-bold text-purple-700">₹{marketAnalytics.volatility}</p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded text-blue-600"><InsightIcon className="h-4 w-4" /></div>
                {t('pricePrediction')} ({timePeriod === 'year' ? t('nextMonth') : t('nextWeek')})
              </h4>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 font-medium">{t('predictedPrice')}</span>
                      <span className="text-2xl font-bold text-blue-600">₹{marketAnalytics.prediction.nextWeekPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">{t('confidenceLevel')}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${marketAnalytics.prediction.confidence}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-blue-600">{marketAnalytics.prediction.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-px h-24 bg-blue-200 hidden md:block"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700 mb-3">{t('keyFactors')}:</p>
                    <ul className="space-y-2">
                      {marketAnalytics.prediction.factors.map((factor, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600 bg-white/60 p-2 rounded-lg">
                          <div className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></div>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Pattern Analysis */}
            <div className="mb-2">
              <h4 className="font-bold text-gray-900 mb-4">
                {timePeriod === 'year' ? t('monthlyPattern') :
                  timePeriod === 'month' ? t('weekly') :
                    t('recent')} {t('pricePattern')}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {marketAnalytics.seasonalPattern.map((pattern, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{pattern.month}</p>
                    <p className="font-bold text-gray-900 text-lg">₹{Math.round(pattern.avgPrice)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Historical Chart */}
        {historicalData.length > 0 && (
          <div className="card p-8 animate-enter" style={{ animationDelay: '0.7s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-1 h-8 bg-gray-800 rounded-full"></span>
                {t('priceTrend')}
              </h3>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {t('dataPoints')} <span className="font-bold text-gray-900">{historicalData.length}</span>
              </div>
            </div>
            <div className="h-80">
              {(() => {
                // Prepare data based on selected period
                if (timePeriod === 'year') {
                  const byMonth: Record<string, { sum: number; count: number }> = {};
                  for (const d of historicalData) {
                    const [y, m] = d.date.split('-');
                    const key = `${y}-${m}`;
                    if (!byMonth[key]) byMonth[key] = { sum: 0, count: 0 };
                    byMonth[key].sum += d.price; byMonth[key].count += 1;
                  }
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const monthSeries = Object.keys(byMonth).sort().map(k => {
                    const monthIdx = parseInt(k.split('-')[1], 10) - 1;
                    return { month: monthNames[monthIdx], price: Math.round(byMonth[k].sum / byMonth[k].count) };
                  });
                  return <PriceChart data={monthSeries} xKey="month" />;
                }
                if (timePeriod === 'month') {
                  const monthData = historicalData.map(d => ({ date: d.date, price: d.price }));
                  return <PriceChart data={monthData} xKey="date" />;
                }
                const last30 = historicalData.map(d => ({ date: d.date, price: d.price }));
                return <PriceChart data={last30} xKey="date" />;
              })()}
            </div>
          </div>
        )}

        {/* Alerts Panel */}
        {showAlerts && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col animate-enter">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-gray-600" />
                  {t('marketAlerts')}
                </h3>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-5 space-y-3 overflow-y-auto">
                {marketAlerts.length === 0 ? (
                  <div className="text-center py-10">
                    <BellIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">{t('noAlertsYet')}</p>
                  </div>
                ) : (
                  marketAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-xl border-l-4 shadow-sm ${alert.priority === 'high' ? 'bg-red-50 border-red-500' :
                        alert.priority === 'medium' ? 'bg-orange-50 border-orange-500' :
                          'bg-blue-50 border-blue-500'
                      }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900">{alert.commodity}</p>
                          <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!alert.isRead && (
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-blue-100"></div>
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
            <div className="flex flex-col justify-center items-center h-48">
              <LoadingSpinner />
              <p className="text-sm text-gray-500 mt-4 animate-pulse">Analyzing market trends...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg font-medium font-sans">
                  {insight}
                </p>
              </div>
              {insight && (
                <div className="flex items-start gap-4 p-4 bg-white border border-blue-100 rounded-xl shadow-sm">
                  <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                    <InsightIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm mb-1">AI Analysis</h5>
                    <p className="text-sm text-gray-600">
                      {t('aiInsightRealtime')}
                    </p>
                  </div>
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
