import axios from 'axios';

// Backend API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-api.com/api' 
  : '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface MarketPrice {
  id: string;
  commodity: string;
  price: number;
  unit: string;
  market: string;
  date: string;
  change: number;
  changePercent: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  description: string;
  forecast: {
    date: string;
    temp: number;
    description: string;
  }[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  provider: string;
  rating: number;
  category: string;
  image?: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  farmerType: string;
  avatar?: string;
  // Address fields
  village?: string;
  state?: string;
  city?: string;
  country?: string;
}

// Import mock backend for development
import { mockBackend } from './mockBackend';

// API endpoints
export const marketApi = {
  // Get market prices
  getPrices: async (): Promise<ApiResponse<MarketPrice[]>> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockBackend.getPrices();
      }
      const response = await api.get('/market/prices');
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to fetch market prices' };
    }
  },

  // Get price history for a commodity
  getPriceHistory: async (commodity: string): Promise<ApiResponse<MarketPrice[]>> => {
    try {
      const response = await api.get(`/market/prices/history/${commodity}`);
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to fetch price history' };
    }
  },

  // Get weather data
  getWeather: async (location: string): Promise<ApiResponse<WeatherData>> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockBackend.getWeather(location);
      }
      const response = await api.get(`/weather/${location}`);
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to fetch weather data' };
    }
  }
};

export const servicesApi = {
  // Get all services
  getServices: async (category?: string): Promise<ApiResponse<Service[]>> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockBackend.getServices(category);
      }
      const url = category ? `/services?category=${category}` : '/services';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to fetch services' };
    }
  },

  // Book a service
  bookService: async (serviceId: string, details: any): Promise<ApiResponse<any>> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockBackend.bookService(serviceId, details);
      }
      const response = await api.post(`/services/${serviceId}/book`, details);
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to book service' };
    }
  }
};

export const chatApi = {
  // Send message to AI
  sendMessage: async (message: string, context?: any): Promise<ApiResponse<ChatMessage>> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockBackend.sendMessage(message, context);
      }
      const response = await api.post('/chat/message', { message, context });
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to send message' };
    }
  },

  // Get chat history
  getHistory: async (): Promise<ApiResponse<ChatMessage[]>> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockBackend.getChatHistory();
      }
      const response = await api.get('/chat/history');
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to fetch chat history' };
    }
  }
};

export const userApi = {
  // Get user profile
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockBackend.getUserProfile();
      }
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to fetch user profile' };
    }
  },

  // Update user profile
  updateProfile: async (profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockBackend.updateUserProfile(profile);
      }
      const response = await api.put('/user/profile', profile);
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  },

  // Login
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; user: UserProfile }>> => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.data.token);
      }
      return response.data;
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  },

  // Register
  register: async (userData: { name: string; email: string; password: string; phone: string }): Promise<ApiResponse<{ token: string; user: UserProfile }>> => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.data.token);
      }
      return response.data;
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
};

export default api;
