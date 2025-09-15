/**
 * Real-time Agriculture Market Price Service
 * Provides live market data, price alerts, and market analysis
 */

import { notificationService } from './notificationService';

export interface RealTimeMarketPrice {
  id: string;
  commodity: string;
  variety?: string;
  market: string;
  state: string;
  district: string;
  price: number;
  unit: string;
  timestamp: string;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  quality: 'FAQ' | 'Good' | 'Average' | 'Poor';
  source: 'APMC' | 'Private' | 'FPO' | 'Direct';
  trend: 'rising' | 'falling' | 'stable';
}

export interface MarketAlert {
  id: string;
  commodity: string;
  market: string;
  alertType: 'price_target' | 'price_drop' | 'price_spike' | 'volume_alert';
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  isRead: boolean;
}

export interface PriceComparison {
  commodity: string;
  markets: {
    market: string;
    price: number;
    distance?: number;
    transportCost?: number;
    netPrice?: number;
  }[];
  bestMarket: string;
  priceDifference: number;
}

export interface MarketAnalytics {
  commodity: string;
  avgPrice: number;
  highestPrice: number;
  lowestPrice: number;
  volatility: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  prediction: {
    nextWeekPrice: number;
    confidence: number;
    factors: string[];
  };
  seasonalPattern: {
    month: string;
    avgPrice: number;
  }[];
}

class RealTimeMarketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private subscribers: Map<string, (data: RealTimeMarketPrice[]) => void> = new Map();
  private alertSubscribers: Map<string, (alert: MarketAlert) => void> = new Map();
  private priceAlerts: MarketAlert[] = [];
  private currentPrices: Map<string, RealTimeMarketPrice> = new Map();

  constructor() {
    this.initializeMockData();
    this.startPriceUpdates();
  }

  // Initialize with mock data for demonstration
  private initializeMockData() {
    const mockPrices: RealTimeMarketPrice[] = [
      {
        id: '1',
        commodity: 'Wheat',
        variety: 'HD-2967',
        market: 'Delhi (Najafgarh)',
        state: 'Delhi',
        district: 'South West Delhi',
        price: 2150,
        unit: 'Quintal',
        timestamp: new Date().toISOString(),
        priceChange: 25,
        priceChangePercent: 1.18,
        volume: 450,
        quality: 'FAQ',
        source: 'APMC',
        trend: 'rising'
      },
      {
        id: '2',
        commodity: 'Rice',
        variety: 'Basmati-1121',
        market: 'Punjab (Amritsar)',
        state: 'Punjab',
        district: 'Amritsar',
        price: 4200,
        unit: 'Quintal',
        timestamp: new Date().toISOString(),
        priceChange: -30,
        priceChangePercent: -0.71,
        volume: 280,
        quality: 'Good',
        source: 'APMC',
        trend: 'falling'
      },
      {
        id: '3',
        commodity: 'Cotton',
        variety: 'Bt Cotton',
        market: 'Gujarat (Rajkot)',
        state: 'Gujarat',
        district: 'Rajkot',
        price: 8500,
        unit: 'Quintal',
        timestamp: new Date().toISOString(),
        priceChange: 150,
        priceChangePercent: 1.8,
        volume: 180,
        quality: 'Good',
        source: 'APMC',
        trend: 'rising'
      },
      {
        id: '4',
        commodity: 'Sugarcane',
        market: 'Maharashtra (Pune)',
        state: 'Maharashtra',
        district: 'Pune',
        price: 320,
        unit: 'Quintal',
        timestamp: new Date().toISOString(),
        priceChange: 5,
        priceChangePercent: 1.59,
        volume: 650,
        quality: 'Average',
        source: 'Private',
        trend: 'stable'
      },
      {
        id: '5',
        commodity: 'Maize',
        variety: 'Composite',
        market: 'Karnataka (Bangalore)',
        state: 'Karnataka',
        district: 'Bangalore Rural',
        price: 1850,
        unit: 'Quintal',
        timestamp: new Date().toISOString(),
        priceChange: -20,
        priceChangePercent: -1.07,
        volume: 320,
        quality: 'FAQ',
        source: 'APMC',
        trend: 'falling'
      },
      {
        id: '6',
        commodity: 'Onion',
        variety: 'Red Onion',
        market: 'Maharashtra (Nashik)',
        state: 'Maharashtra',
        district: 'Nashik',
        price: 2800,
        unit: 'Quintal',
        timestamp: new Date().toISOString(),
        priceChange: 200,
        priceChangePercent: 7.69,
        volume: 420,
        quality: 'Good',
        source: 'APMC',
        trend: 'rising'
      }
    ];

    mockPrices.forEach(price => {
      this.currentPrices.set(`${price.commodity}-${price.market}`, price);
    });
  }

  // Start real-time price updates simulation
  private startPriceUpdates() {
    setInterval(() => {
      this.simulatePriceUpdates();
    }, 30000); // Update every 30 seconds
  }

  // Simulate real-time price changes
  private simulatePriceUpdates() {
    this.currentPrices.forEach((price, key) => {
      const change = (Math.random() - 0.5) * 100; // Random change between -50 and +50
      const newPrice = Math.max(100, price.price + change); // Minimum price of 100
      const changePercent = ((newPrice - price.price) / price.price) * 100;

      const updatedPrice: RealTimeMarketPrice = {
        ...price,
        price: Math.round(newPrice),
        priceChange: Math.round(change),
        priceChangePercent: Math.round(changePercent * 100) / 100,
        timestamp: new Date().toISOString(),
        trend: change > 10 ? 'rising' : change < -10 ? 'falling' : 'stable',
        volume: Math.max(50, price.volume + Math.floor((Math.random() - 0.5) * 100))
      };

      this.currentPrices.set(key, updatedPrice);

      // Check for alerts
      this.checkPriceAlerts(updatedPrice);
    });

    // Notify subscribers
    this.notifySubscribers();
  }

  // Subscribe to real-time price updates
  public subscribe(subscriberId: string, callback: (data: RealTimeMarketPrice[]) => void) {
    this.subscribers.set(subscriberId, callback);
    // Send initial data
    callback(Array.from(this.currentPrices.values()));
  }

  // Unsubscribe from price updates
  public unsubscribe(subscriberId: string) {
    this.subscribers.delete(subscriberId);
  }

  // Subscribe to price alerts
  public subscribeToAlerts(subscriberId: string, callback: (alert: MarketAlert) => void) {
    this.alertSubscribers.set(subscriberId, callback);
  }

  // Notify all subscribers
  private notifySubscribers() {
    const currentData = Array.from(this.currentPrices.values());
    this.subscribers.forEach(callback => {
      try {
        callback(currentData);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  // Get current market prices
  public async getCurrentPrices(commodity?: string, market?: string): Promise<RealTimeMarketPrice[]> {
    let prices = Array.from(this.currentPrices.values());
    
    if (commodity) {
      prices = prices.filter(p => p.commodity.toLowerCase().includes(commodity.toLowerCase()));
    }
    
    if (market) {
      prices = prices.filter(p => p.market.toLowerCase().includes(market.toLowerCase()));
    }
    
    return prices.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get price comparison across markets
  public async getPriceComparison(commodity: string, userLocation?: string): Promise<PriceComparison> {
    const prices = await this.getCurrentPrices(commodity);
    
    const markets = prices.map(price => ({
      market: price.market,
      price: price.price,
      distance: Math.floor(Math.random() * 500), // Mock distance
      transportCost: Math.floor(Math.random() * 200), // Mock transport cost
      netPrice: price.price - Math.floor(Math.random() * 200)
    }));

    const bestMarket = markets.reduce((best, current) => 
      (current.netPrice || current.price) > (best.netPrice || best.price) ? current : best
    );

    const worstMarket = markets.reduce((worst, current) => 
      (current.netPrice || current.price) < (worst.netPrice || worst.price) ? current : worst
    );

    return {
      commodity,
      markets,
      bestMarket: bestMarket.market,
      priceDifference: (bestMarket.netPrice || bestMarket.price) - (worstMarket.netPrice || worstMarket.price)
    };
  }

  // Get market analytics with time period support
  public async getMarketAnalytics(
    commodity: string, 
    period: 'last30' | 'month' | 'year' = 'last30'
  ): Promise<MarketAnalytics> {
    const prices = await this.getCurrentPrices(commodity);
    
    if (prices.length === 0) {
      throw new Error(`No data found for commodity: ${commodity}`);
    }

    const priceValues = prices.map(p => p.price);
    const avgPrice = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
    const highestPrice = Math.max(...priceValues);
    const lowestPrice = Math.min(...priceValues);
    
    // Calculate volatility (standard deviation)
    const variance = priceValues.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / priceValues.length;
    const volatility = Math.sqrt(variance);

    // Determine trend based on selected period
    const recentPrices = prices.slice(0, 5).map(p => p.price);
    const oldPrices = prices.slice(-5).map(p => p.price);
    const recentAvg = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
    const oldAvg = oldPrices.reduce((sum, price) => sum + price, 0) / oldPrices.length;
    
    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (recentAvg > oldAvg * 1.05) trend = 'bullish';
    else if (recentAvg < oldAvg * 0.95) trend = 'bearish';

    // Generate seasonal pattern based on period
    let seasonalPattern: { month: string; avgPrice: number }[];
    
    if (period === 'year') {
      // Monthly pattern for yearly view
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      seasonalPattern = months.map(month => ({
        month,
        avgPrice: Math.round(avgPrice * (0.8 + Math.random() * 0.4)) // Vary between 80-120% of avg
      }));
    } else if (period === 'month') {
      // Weekly pattern for monthly view
      seasonalPattern = ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => ({
        month: week,
        avgPrice: Math.round(avgPrice * (0.9 + Math.random() * 0.2)) // Vary between 90-110% of avg
      }));
    } else {
      // Daily pattern for last 30 days
      seasonalPattern = Array.from({length: 6}, (_, i) => ({
        month: `Day ${(i + 1) * 5}`,
        avgPrice: Math.round(avgPrice * (0.95 + Math.random() * 0.1)) // Small variations
      }));
    }

    // Adjust prediction confidence based on period
    let predictionMultiplier = 1;
    let confidenceBase = 70;
    
    switch (period) {
      case 'year':
        predictionMultiplier = 1.2; // Larger price changes possible
        confidenceBase = 60; // Lower confidence for longer periods
        break;
      case 'month':
        predictionMultiplier = 1.1;
        confidenceBase = 75;
        break;
      case 'last30':
        predictionMultiplier = 1.05;
        confidenceBase = 80; // Higher confidence for shorter periods
        break;
    }

    return {
      commodity,
      avgPrice: Math.round(avgPrice),
      highestPrice,
      lowestPrice,
      volatility: Math.round(volatility),
      trend,
      prediction: {
        nextWeekPrice: Math.round(avgPrice * predictionMultiplier * (1 + (Math.random() - 0.5) * 0.1)),
        confidence: Math.floor(Math.random() * 30) + confidenceBase,
        factors: this.getPredictionFactors(period, trend)
      },
      seasonalPattern
    };
  }

  // Get prediction factors based on period and trend
  private getPredictionFactors(period: 'last30' | 'month' | 'year', trend: 'bullish' | 'bearish' | 'neutral'): string[] {
    const factors = {
      year: [
        'Annual crop cycle patterns',
        'Monsoon season impact',
        'Export demand trends',
        'Government policy changes',
        'Global commodity prices'
      ],
      month: [
        'Seasonal demand variations',
        'Weather conditions',
        'Festival season impact',
        'Storage and transportation',
        'Regional supply changes'
      ],
      last30: [
        'Recent weather patterns',
        'Daily market sentiment',
        'Transport disruptions',
        'Local supply fluctuations',
        'Short-term demand spikes'
      ]
    };

    const trendFactors = {
      bullish: ['Increasing demand', 'Supply constraints', 'Positive market sentiment'],
      bearish: ['Oversupply conditions', 'Reduced demand', 'Market corrections'],
      neutral: ['Balanced supply-demand', 'Stable market conditions', 'Normal trading patterns']
    };

    return [...factors[period].slice(0, 3), ...trendFactors[trend].slice(0, 2)];
  }

  // Set price alert
  public setPriceAlert(commodity: string, targetPrice: number, alertType: 'above' | 'below'): MarketAlert {
    const alert: MarketAlert = {
      id: Date.now().toString(),
      commodity,
      market: 'All Markets',
      alertType: 'price_target',
      message: `Alert when ${commodity} price goes ${alertType} ₹${targetPrice}`,
      priority: 'medium',
      timestamp: new Date().toISOString(),
      isRead: false
    };

    this.priceAlerts.push(alert);
    return alert;
  }

  // Check price alerts
  private checkPriceAlerts(price: RealTimeMarketPrice) {
    // Check for significant price changes
    if (Math.abs(price.priceChangePercent) > 5) {
      const alert: MarketAlert = {
        id: Date.now().toString(),
        commodity: price.commodity,
        market: price.market,
        alertType: 'price_spike',
        message: `${price.commodity} price ${price.priceChangePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(price.priceChangePercent)}%`,
        priority: Math.abs(price.priceChangePercent) > 10 ? 'high' : 'medium',
        timestamp: new Date().toISOString(),
        isRead: false
      };

      // Notify alert subscribers
      this.alertSubscribers.forEach(callback => {
        try {
          callback(alert);
        } catch (error) {
          console.error('Error sending alert:', error);
        }
      });

      // Send notification using notification service
      notificationService.handlePriceSpike(
        price.commodity,
        price.market,
        price.priceChangePercent,
        price.price
      );
    }

    // Check for high volume
    if (price.volume > 800) {
      notificationService.handleVolumeAlert(
        price.commodity,
        price.market,
        price.volume,
        800
      );
    }
  }

  // Get historical data with time period support
  public async getHistoricalData(
    commodity: string, 
    period: 'last30' | 'month' | 'year' = 'last30'
  ): Promise<{ date: string; price: number; volume: number }[]> {
    // Mock historical data
    const data = [];
    const basePrice = this.currentPrices.get(`${commodity}-${Array.from(this.currentPrices.keys())[0].split('-')[1]}`)?.price || 2000;
    
    let days: number;
    let startDate = new Date();
    
    switch (period) {
      case 'last30':
        days = 30;
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'month':
        // Current month from 1st to today
        days = startDate.getDate();
        startDate.setDate(1);
        break;
      case 'year':
        // Current year from January 1st to today
        const dayOfYear = Math.floor((Date.now() - new Date(startDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        days = dayOfYear;
        startDate = new Date(startDate.getFullYear(), 0, 1);
        break;
      default:
        days = 30;
        startDate.setDate(startDate.getDate() - 30);
    }
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Create more realistic price variations based on time period
      let priceVariation: number;
      if (period === 'year') {
        // Larger variations for yearly data with seasonal patterns
        const monthFactor = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 0.2; // Seasonal variation
        priceVariation = (Math.random() - 0.5) * 1000 + (monthFactor * basePrice);
      } else if (period === 'month') {
        // Medium variations for monthly data
        priceVariation = (Math.random() - 0.5) * 300;
      } else {
        // Small variations for last 30 days
        priceVariation = (Math.random() - 0.5) * 200;
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(Math.max(100, basePrice + priceVariation)),
        volume: Math.floor(Math.random() * 1000) + 100
      });
    }
    
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Get market summary
  public async getMarketSummary(): Promise<{
    totalCommodities: number;
    avgPriceChange: number;
    topGainers: RealTimeMarketPrice[];
    topLosers: RealTimeMarketPrice[];
    highVolume: RealTimeMarketPrice[];
  }> {
    const prices = Array.from(this.currentPrices.values());
    
    const totalCommodities = prices.length;
    const avgPriceChange = prices.reduce((sum, p) => sum + p.priceChangePercent, 0) / prices.length;
    
    const topGainers = [...prices]
      .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
      .slice(0, 3);
    
    const topLosers = [...prices]
      .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
      .slice(0, 3);
    
    const highVolume = [...prices]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3);

    return {
      totalCommodities,
      avgPriceChange: Math.round(avgPriceChange * 100) / 100,
      topGainers,
      topLosers,
      highVolume
    };
  }
}

// Create singleton instance
export const realtimeMarketService = new RealTimeMarketService();
export default realtimeMarketService;
