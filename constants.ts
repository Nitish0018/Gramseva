
import type { Crop, Service, UserProfile, ChatMessage } from './types';
import wheatPng from './icon/pngtree-wheat-icon-design-template-illustration-png-image_5977233.jpg';
import ricePng from './icon/png-clipart-rice-cereal-computer-icons-wheat-rice-food-leaf-thumbnail.png';
import cottonPng from './icon/328-3280007_transparent-cotton-icon.png';
import profilePhoto from './profile/pexels-mnannapaneni-5933416.jpg';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳'
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳'
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    flag: '🇮🇳'
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳'
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳'
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    flag: '🇮🇳'
  }
];

export const CROPS: Crop[] = [
  {
  id: 1,
  name: 'Wheat',
  icon: '🌾',
  iconImage: wheatPng,
    currentPrice: 2150,
    priceChange: 1.5,
    historicalData: [
      { month: 'Jan', price: 2000 },
      { month: 'Feb', price: 2050 },
      { month: 'Mar', price: 2100 },
      { month: 'Apr', price: 2120 },
      { month: 'May', price: 2180 },
      { month: 'Jun', price: 2150 },
    ],
  },
  {
    id: 2,
    name: 'Rice',
  icon: '🍚',
  iconImage: ricePng,
    currentPrice: 3500,
    priceChange: -0.8,
    historicalData: [
      { month: 'Jan', price: 3600 },
      { month: 'Feb', price: 3550 },
      { month: 'Mar', price: 3580 },
      { month: 'Apr', price: 3520 },
      { month: 'May', price: 3480 },
      { month: 'Jun', price: 3500 },
    ],
  },
  {
    id: 3,
    name: 'Cotton',
  icon: '🧵',
  iconImage: cottonPng,
    currentPrice: 8500,
    priceChange: 2.1,
    historicalData: [
      { month: 'Jan', price: 8200 },
      { month: 'Feb', price: 8300 },
      { month: 'Mar', price: 8450 },
      { month: 'Apr', price: 8400 },
      { month: 'May', price: 8600 },
      { month: 'Jun', price: 8500 },
    ],
  },
];

export const SERVICES: Service[] = [
  {
    id: '1',
    title: 'Tractor Rental',
    description: 'High-quality tractor available for rent with experienced operator',
    provider: 'Ramesh Kumar',
    rating: 4.8,
    price: 700,
    category: 'equipment',
    image: 'https://picsum.photos/seed/tractor/300/200',
  },
  {
    id: '2',
    title: 'Harvesting Labor',
    description: 'Skilled labor team for efficient crop harvesting services',
    provider: 'Sita Devi & Group',
    rating: 4.9,
    price: 400,
    category: 'labor',
    image: 'https://picsum.photos/seed/harvest/300/200',
  },
  {
    id: '3',
    title: 'Seed & Fertilizer Supply',
    description: 'Premium quality seeds and organic fertilizers for better yield',
    provider: 'Gupta Traders',
    rating: 4.5,
    price: 0,
    category: 'supplies',
    image: 'https://picsum.photos/seed/fertilizer/300/200',
  },
  {
    id: '4',
    title: 'Crop Transportation',
    description: 'Reliable transportation service for your agricultural produce',
    provider: 'Singh Logistics',
    rating: 4.7,
    price: 20,
    category: 'transport',
    image: 'https://picsum.photos/seed/truck/300/200',
  },
  // Added more services for farmers across categories
  {
    id: '5',
    title: 'Soil Testing Service',
    description: 'On-site soil sampling with detailed nutrient analysis and recommendations',
    provider: 'AgriLabs India',
    rating: 4.6,
    price: 299,
    category: 'soil',
    image: 'https://picsum.photos/seed/soil/300/200',
  },
  {
    id: '6',
    title: 'Drip Irrigation Setup',
    description: 'Design and installation of water-efficient drip irrigation systems',
    provider: 'Jal Seva Irrigation',
    rating: 4.7,
    price: 2500,
    category: 'irrigation',
    image: 'https://picsum.photos/seed/drip/300/200',
  },
  {
    id: '7',
    title: 'Pest Control (Organic)',
    description: 'Eco-friendly pest management using organic sprays and traps',
    provider: 'GreenShield',
    rating: 4.4,
    price: 499,
    category: 'advisory',
    image: 'https://picsum.photos/seed/pest/300/200',
  },
  {
    id: '8',
    title: 'Cold Storage Rental',
    description: 'Short-term cold storage to reduce post-harvest loss',
    provider: 'FreshKeep Warehouses',
    rating: 4.3,
    price: 1500,
    category: 'storage',
    image: 'https://picsum.photos/seed/coldstorage/300/200',
  },
  {
    id: '9',
    title: 'Agri-Drone Spraying',
    description: 'Precision spraying service using drones for uniform coverage',
    provider: 'SkyFarm Tech',
    rating: 4.5,
    price: 1200,
    category: 'drone',
    image: 'https://picsum.photos/seed/drone/300/200',
  },
  {
    id: '10',
    title: 'Seed Treatment',
    description: 'Professional seed treatment service to improve germination and vigor',
    provider: 'Bharat Krishi Kendra',
    rating: 4.2,
    price: 199,
    category: 'seeds',
    image: 'https://picsum.photos/seed/seed/300/200',
  },
  {
    id: '11',
    title: 'Market Linkage',
    description: 'Connect directly with buyers and mandis for better prices',
    provider: 'Kisan Connect',
    rating: 4.1,
    price: 0,
    category: 'market',
    image: 'https://picsum.photos/seed/market/300/200',
  },
  {
    id: '12',
    title: 'Crop Insurance Assistance',
    description: 'Help with crop insurance enrollment and claims support',
    provider: 'Suraksha Insure',
    rating: 4.0,
    price: 0,
    category: 'insurance',
    image: 'https://picsum.photos/seed/insurance/300/200',
  },
  {
    id: '13',
    title: 'Agro Credit Facilitation',
    description: 'Assistance in applying for low-interest agricultural loans',
    provider: 'Grameen Finance',
    rating: 4.2,
    price: 0,
    category: 'credit',
    image: 'https://picsum.photos/seed/credit/300/200',
  },
  {
    id: '14',
    title: 'Farmer Training Workshop',
    description: 'One-day training on modern cultivation and water-saving practices',
    provider: 'Krishi Vigyan Kendra',
    rating: 4.6,
    price: 99,
    category: 'training',
    image: 'https://picsum.photos/seed/training/300/200',
  },
];

export const USER_PROFILE: UserProfile = {
    name: 'Raju Sharma',
    village: 'Ramgarh',
  avatarUrl: profilePhoto,
    rating: 4.7,
    reviews: 23,
    kycVerified: true,
    memberSince: 'January 2020',
    // Address details
    state: 'Gujarat',
    city: 'Ahmedabad',
    country: 'India',
};

export const CHAT_MESSAGES: ChatMessage[] = [
    { id: '1', sender: 'bot', type: 'text', content: 'Hello! My name is riya, How can help you with farming questions, market prices, and agricultural advice. What would you like to know?', timestamp: '9:30 AM'},
    { id: '2', sender: 'user', type: 'text', content: 'What is the current price of wheat in the market?', timestamp: '9:31 AM'},
    { id: '3', sender: 'bot', type: 'text', content: 'Current wheat prices are around ₹2150 per quintal, showing a 1.5% increase from last week. This is a good time to consider selling if you have stock.', timestamp: '9:32 AM'},
    { id: '4', sender: 'user', type: 'text', content: 'Thank you! Can you also tell me about weather conditions?', timestamp: '9:33 AM'},
];
