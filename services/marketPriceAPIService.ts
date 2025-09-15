/**
 * Agriculture Market Price API Integration
 * Connects to various Indian agricultural market data sources
 */

interface APMCMarketData {
  commodity: string;
  variety: string;
  arrivals: number;
  minimum_price: number;
  maximum_price: number;
  modal_price: number;
  date: string;
  market: string;
  district: string;
  state: string;
}

interface RealTimeAPIConfig {
  // Government APIs
  apmcApiKey?: string;
  nic_api_key?: string;
  
  // Commercial APIs
  agmarknet_api_key?: string;
  commodity_api_key?: string;
  
  // Polling intervals (in seconds)
  polling_interval: number;
  
  // Supported commodities
  commodities: string[];
  
  // Supported markets
  markets: string[];
}

class MarketPriceAPIService {
  private config: RealTimeAPIConfig;
  private isConnected: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = this.getDefaultConfig();
  }

  private getDefaultConfig(): RealTimeAPIConfig {
    return {
      polling_interval: 60, // 1 minute
      commodities: [
        'wheat', 'rice', 'cotton', 'sugarcane', 'maize', 'onion',
        'potato', 'tomato', 'soybean', 'mustard', 'groundnut'
      ],
      markets: [
        'delhi', 'mumbai', 'kolkata', 'chennai', 'bangalore',
        'pune', 'ahmedabad', 'jaipur', 'lucknow', 'bhopal'
      ]
    };
  }

  // Initialize connection to APIs
  public async connect(): Promise<boolean> {
    try {
      // Test connections to various API endpoints
      const connectionTests = await Promise.allSettled([
        this.testAgmarknetConnection(),
        this.testNICConnection(),
        this.testAPMCConnection()
      ]);

      const successfulConnections = connectionTests.filter(
        result => result.status === 'fulfilled'
      ).length;

      this.isConnected = successfulConnections > 0;
      
      if (this.isConnected) {
        this.startPolling();
      }

      return this.isConnected;
    } catch (error) {
      console.error('Failed to connect to market APIs:', error);
      return false;
    }
  }

  // Test Agmarknet API connection
  private async testAgmarknetConnection(): Promise<boolean> {
    try {
      // Agmarknet.gov.in API endpoint
      const response = await fetch('https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=demo&format=json&limit=1');
      return response.ok;
    } catch (error) {
      console.warn('Agmarknet API not available:', error);
      return false;
    }
  }

  // Test NIC API connection
  private async testNICConnection(): Promise<boolean> {
    try {
      // Sample NIC data API
      const response = await fetch('https://www.nicnic.in/api/market-prices', {
        headers: {
          'Authorization': `Bearer ${this.config.nic_api_key || 'demo'}`
        }
      });
      return response.ok;
    } catch (error) {
      console.warn('NIC API not available:', error);
      return false;
    }
  }

  // Test APMC API connection
  private async testAPMCConnection(): Promise<boolean> {
    try {
      // Mock APMC API endpoint
      const response = await fetch('/api/apmc/prices');
      return response.ok;
    } catch (error) {
      console.warn('APMC API not available:', error);
      return false;
    }
  }

  // Fetch data from Agmarknet
  private async fetchAgmarknetData(commodity: string): Promise<APMCMarketData[]> {
    try {
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=demo&format=json&filters[commodity]=${commodity}&limit=100`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Agmarknet data');
      }

      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Error fetching Agmarknet data:', error);
      return [];
    }
  }

  // Fetch data from multiple sources and aggregate
  public async fetchLatestPrices(commodity?: string): Promise<APMCMarketData[]> {
    try {
      const commoditiesToFetch = commodity 
        ? [commodity.toLowerCase()] 
        : this.config.commodities;

      const allData: APMCMarketData[] = [];

      for (const comm of commoditiesToFetch) {
        // Try multiple data sources
        const agmarknetData = await this.fetchAgmarknetData(comm);
        allData.push(...agmarknetData);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return this.processRawData(allData);
    } catch (error) {
      console.error('Error fetching latest prices:', error);
      return [];
    }
  }

  // Process and clean raw API data
  private processRawData(rawData: any[]): APMCMarketData[] {
    return rawData.map(item => ({
      commodity: this.normalizeCommodityName(item.commodity || item.Commodity),
      variety: item.variety || item.Variety || '',
      arrivals: parseFloat(item.arrivals || item.Arrivals || '0'),
      minimum_price: parseFloat(item.min_price || item.Min_Price || '0'),
      maximum_price: parseFloat(item.max_price || item.Max_Price || '0'),
      modal_price: parseFloat(item.modal_price || item.Modal_Price || '0'),
      date: this.normalizeDate(item.date || item.Date),
      market: item.market || item.Market || '',
      district: item.district || item.District || '',
      state: item.state || item.State || ''
    })).filter(item => item.modal_price > 0); // Filter out invalid entries
  }

  // Normalize commodity names for consistency
  private normalizeCommodityName(name: string): string {
    const normalizations: Record<string, string> = {
      'paddy': 'rice',
      'kapas': 'cotton',
      'ganna': 'sugarcane',
      'makka': 'maize',
      'gehun': 'wheat',
      'sarso': 'mustard',
      'mungfali': 'groundnut',
      'soyabean': 'soybean'
    };

    const lowercaseName = name.toLowerCase().trim();
    return normalizations[lowercaseName] || lowercaseName;
  }

  // Normalize date formats
  private normalizeDate(dateStr: string): string {
    try {
      // Handle various Indian date formats
      const date = new Date(dateStr);
      return date.toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  // Start polling for real-time updates
  private startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      try {
        const latestData = await this.fetchLatestPrices();
        
        // Emit update event (you could use EventEmitter here)
        this.onDataUpdate(latestData);
      } catch (error) {
        console.error('Error during polling:', error);
      }
    }, this.config.polling_interval * 1000);
  }

  // Handle data updates
  private onDataUpdate(data: APMCMarketData[]) {
    // This would emit events or call callbacks
    console.log('New market data received:', data.length, 'records');
    
    // You could integrate this with your real-time service
    // realtimeMarketService.updateFromAPI(data);
  }

  // Get market trends analysis
  public async getMarketTrends(commodity: string, days: number = 7): Promise<{
    trend: 'rising' | 'falling' | 'stable';
    averageChange: number;
    volatility: number;
  }> {
    try {
      const data = await this.fetchLatestPrices(commodity);
      
      if (data.length < 2) {
        return { trend: 'stable', averageChange: 0, volatility: 0 };
      }

      // Sort by date
      const sortedData = data.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const prices = sortedData.slice(0, days).map(d => d.modal_price);
      
      // Calculate trend
      const firstPrice = prices[prices.length - 1];
      const lastPrice = prices[0];
      const change = ((lastPrice - firstPrice) / firstPrice) * 100;

      let trend: 'rising' | 'falling' | 'stable' = 'stable';
      if (change > 2) trend = 'rising';
      else if (change < -2) trend = 'falling';

      // Calculate volatility (standard deviation)
      const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
      const volatility = Math.sqrt(variance);

      return {
        trend,
        averageChange: Math.round(change * 100) / 100,
        volatility: Math.round(volatility * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating market trends:', error);
      return { trend: 'stable', averageChange: 0, volatility: 0 };
    }
  }

  // Get price comparison across markets
  public async getPriceComparison(commodity: string, topN: number = 5): Promise<{
    highest: APMCMarketData[];
    lowest: APMCMarketData[];
    average: number;
  }> {
    try {
      const data = await this.fetchLatestPrices(commodity);
      
      const sortedByPrice = data.sort((a, b) => b.modal_price - a.modal_price);
      const highest = sortedByPrice.slice(0, topN);
      const lowest = sortedByPrice.slice(-topN).reverse();
      
      const average = data.reduce((sum, item) => sum + item.modal_price, 0) / data.length;

      return {
        highest,
        lowest,
        average: Math.round(average * 100) / 100
      };
    } catch (error) {
      console.error('Error getting price comparison:', error);
      return { highest: [], lowest: [], average: 0 };
    }
  }

  // Clean up resources
  public disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isConnected = false;
  }

  // Get connection status
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Update configuration
  public updateConfig(newConfig: Partial<RealTimeAPIConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Restart polling if interval changed
    if (newConfig.polling_interval && this.isConnected) {
      this.startPolling();
    }
  }

  // Get available commodities
  public getAvailableCommodities(): string[] {
    return [...this.config.commodities];
  }

  // Get available markets
  public getAvailableMarkets(): string[] {
    return [...this.config.markets];
  }
}

// Create singleton instance
export const marketPriceAPIService = new MarketPriceAPIService();
export default marketPriceAPIService;
