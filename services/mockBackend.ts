// Mock Backend Server for Development
// This simulates backend API responses when the real backend is not available

interface MockData {
  marketPrices: any[];
  weather: any;
  services: any[];
  chatHistory: any[];
  userProfile: any;
}

const mockData: MockData = {
  marketPrices: [
    {
      id: '1',
      commodity: 'Rice',
      price: 2500,
      unit: 'Quintal',
      market: 'Delhi Mandi',
      date: new Date().toISOString(),
      change: 150,
      changePercent: 6.4
    },
    {
      id: '2',
      commodity: 'Wheat',
      price: 2200,
      unit: 'Quintal',
      market: 'Punjab Mandi',
      date: new Date().toISOString(),
      change: -50,
      changePercent: -2.2
    }
  ],
  weather: {
    location: 'Delhi',
    temperature: 28,
    humidity: 65,
    description: 'Partly cloudy with light winds',
    forecast: [
      { date: '2024-01-16', temp: 30, description: 'Sunny' },
      { date: '2024-01-17', temp: 26, description: 'Cloudy' },
      { date: '2024-01-18', temp: 24, description: 'Rain expected' }
    ]
  },
  services: [
    {
      id: '1',
      title: 'Tractor Rental Service',
      description: 'High-quality tractors available for rent with experienced operators',
      price: 2500,
      provider: 'Ramesh Kumar',
      rating: 4.8,
      category: 'equipment',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400'
    },
    {
      id: '2',
      title: 'Organic Fertilizer Supply',
      description: 'Premium organic fertilizers for better crop yield and soil health',
      price: 800,
      provider: 'Green Earth Supplies',
      rating: 4.6,
      category: 'seeds',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'
    }
  ],
  // Extended mock services for richer marketplace
  // Note: Keeping IDs unique and categories aligned with UI filters
  // Some prices are placeholders and can be adjusted as needed
  // Images use picsum for variety
  // Existing two retained above
  chatHistory: [
    {
      id: '1',
      message: 'What is the best time to plant wheat?',
      sender: 'user',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      message: 'The best time to plant wheat in North India is from October to December, after the monsoon season ends. The ideal temperature range is 15-20°C for germination.',
      sender: 'bot',
      timestamp: new Date(Date.now() - 3590000).toISOString()
    }
  ],
  userProfile: {
    id: '1',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@example.com',
    phone: '+91 98765 43210',
    location: 'Sonipat, Haryana',
    farmerType: 'small',
    avatar: '/profile/pexels-mnannapaneni-5933416.jpg',
    // Address fields
    village: 'Ramgarh',
    city: 'Sonipat',
    state: 'Haryana',
    country: 'India'
  }
};

class MockBackendService {
  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getPrices() {
    await this.delay();
    return {
      success: true,
      data: mockData.marketPrices
    };
  }

  async getWeather(location: string) {
    await this.delay();
    return {
      success: true,
      data: { ...mockData.weather, location }
    };
  }

  async getServices(category?: string) {
    await this.delay();
    let services = mockData.services;
    // If only a couple of services exist, augment with a richer default set
    if (services.length < 6) {
      services = [
        ...services,
        { id: '5', title: 'Soil Testing Service', description: 'On-site soil sampling with detailed nutrient analysis and recommendations', price: 299, provider: 'AgriLabs India', rating: 4.6, category: 'soil', image: 'https://picsum.photos/seed/soil/400/240' },
        { id: '6', title: 'Drip Irrigation Setup', description: 'Design and installation of water-efficient drip irrigation systems', price: 2500, provider: 'Jal Seva Irrigation', rating: 4.7, category: 'irrigation', image: 'https://picsum.photos/seed/drip/400/240' },
        { id: '7', title: 'Pest Control (Organic)', description: 'Eco-friendly pest management using organic sprays and traps', price: 499, provider: 'GreenShield', rating: 4.4, category: 'advisory', image: 'https://picsum.photos/seed/pest/400/240' },
        { id: '8', title: 'Cold Storage Rental', description: 'Short-term cold storage to reduce post-harvest loss', price: 1500, provider: 'FreshKeep Warehouses', rating: 4.3, category: 'storage', image: 'https://picsum.photos/seed/coldstorage/400/240' },
        { id: '9', title: 'Agri-Drone Spraying', description: 'Precision spraying service using drones for uniform coverage', price: 1200, provider: 'SkyFarm Tech', rating: 4.5, category: 'drone', image: 'https://picsum.photos/seed/drone/400/240' },
        { id: '10', title: 'Seed Treatment', description: 'Professional seed treatment service to improve germination and vigor', price: 199, provider: 'Bharat Krishi Kendra', rating: 4.2, category: 'seeds', image: 'https://picsum.photos/seed/seed/400/240' },
        { id: '11', title: 'Market Linkage', description: 'Connect directly with buyers and mandis for better prices', price: 0, provider: 'Kisan Connect', rating: 4.1, category: 'market', image: 'https://picsum.photos/seed/market/400/240' },
        { id: '12', title: 'Crop Insurance Assistance', description: 'Help with crop insurance enrollment and claims support', price: 0, provider: 'Suraksha Insure', rating: 4.0, category: 'insurance', image: 'https://picsum.photos/seed/insurance/400/240' },
        { id: '13', title: 'Agro Credit Facilitation', description: 'Assistance in applying for low-interest agricultural loans', price: 0, provider: 'Grameen Finance', rating: 4.2, category: 'credit', image: 'https://picsum.photos/seed/credit/400/240' },
        { id: '14', title: 'Farmer Training Workshop', description: 'One-day training on modern cultivation and water-saving practices', price: 99, provider: 'Krishi Vigyan Kendra', rating: 4.6, category: 'training', image: 'https://picsum.photos/seed/training/400/240' },
      ];
      mockData.services = services;
    }
    if (category && category !== 'all') {
      services = services.filter(s => s.category === category);
    }
    return {
      success: true,
      data: services
    };
  }

  async sendMessage(message: string, context?: any) {
    await this.delay(1000); // Simulate AI processing time
    
    // Simple response generation based on keywords
    let response = "I understand your question about agriculture. Let me help you with that.";
    
    if (message.toLowerCase().includes('price')) {
      response = "Current market prices are showing good trends. Rice is at ₹2500/quintal with a 6.4% increase this week. Would you like specific price information for any particular crop?";
    } else if (message.toLowerCase().includes('weather')) {
      response = "Today's weather is partly cloudy with 28°C temperature and 65% humidity. It's good for most farming activities. Rain is expected in 2 days.";
    } else if (message.toLowerCase().includes('disease') || message.toLowerCase().includes('pest')) {
      response = "For crop disease management, I recommend regular field inspection and proper preventive measures. Could you describe the symptoms you're seeing on your crops?";
    } else if (message.toLowerCase().includes('fertilizer')) {
      response = "For optimal crop nutrition, consider using a balanced NPK fertilizer. The application rate depends on your soil type and crop. I recommend getting a soil test done first.";
    }

    return {
      success: true,
      data: {
        id: Date.now().toString(),
        message: response,
        sender: 'bot' as const,
        timestamp: new Date().toISOString()
      }
    };
  }

  async getChatHistory() {
    await this.delay();
    return {
      success: true,
      data: mockData.chatHistory
    };
  }

  async getUserProfile() {
    await this.delay();
    return {
      success: true,
      data: mockData.userProfile
    };
  }

  async updateUserProfile(profile: any) {
    await this.delay();
    mockData.userProfile = { ...mockData.userProfile, ...profile };
    return {
      success: true,
      data: mockData.userProfile
    };
  }

  async bookService(serviceId: string, details: any) {
    await this.delay();
    return {
      success: true,
      data: { bookingId: Date.now().toString(), status: 'confirmed' }
    };
  }
}

// Export singleton instance
export const mockBackend = new MockBackendService();

// Override the backend service imports when in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Using mock backend service for development');
}
