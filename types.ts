export type Page = 'market' | 'services' | 'chat' | 'profile' | 'advisory' | 'admin' | 'settings';

export interface Crop {
  id: number;
  name: string;
  icon: string;
  // Optional image URL for icon; when provided, UI will render this instead of emoji
  iconImage?: string;
  currentPrice: number;
  priceChange: number;
  historicalData: { month: string; price: number }[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  provider: string;
  rating: number;
  price: number;
  category: string;
  image?: string;
}

export interface UserProfile {
    name: string;
    village: string;
    avatarUrl: string;
    rating: number;
    reviews: number;
    kycVerified: boolean;
    memberSince: string;
    // Extended properties
    avatar?: string;
    location?: string;
    farmerType?: string;
    phone?: string;
    email?: string;
    // Address fields
    state?: string;
    city?: string;
    country?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

export interface AiMatchResult {
    providerName: string;
    reason: string;
    rating: number;
    contact: string;
}

export interface CropHealthAnalysis {
    isHealthy: boolean;
    disease: string;
    description: string;
    causes: string[];
    organicRemedies: string[];
    chemicalRemedies: string[];
}

// A single saved analysis record shown in Advisory history
export interface CropHealthAnalysisRecord {
  id: string; // unique id
  timestamp: string; // ISO string
  imageDataUrl: string; // data URL of uploaded image for preview
  result: CropHealthAnalysis; // structured AI result
}
