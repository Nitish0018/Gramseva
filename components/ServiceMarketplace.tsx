
import React, { useState, useEffect } from 'react';
import { SERVICES } from '../constants';
import type { AiMatchResult } from '../types';
import { getServiceProviderMatch } from '../services/geminiService';
import { servicesApi, type Service } from '../services/backendService';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  SearchIcon, 
  SparklesIcon, 
  StarIcon, 
  FilterIcon,
  MapPinIcon,
  PhoneIcon,
  VerifiedIcon,
  HeartIcon,
  ShareIcon,
  WalletIcon,
  EyeIcon
} from './icons';

const ServiceMarketplace: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchResult, setMatchResult] = useState<AiMatchResult | string | null>(null);
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const categories = [
    'all',
    'equipment',
    'labor',
    'supplies',
    'transport',
    'seeds',
    'advisory',
    'storage',
    'soil',
    'irrigation',
    'drone',
    'market',
    'insurance',
    'credit',
    'training'
  ];

  useEffect(() => {
    loadServices();
  }, [selectedCategory]);

  const loadServices = async () => {
    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const response = await servicesApi.getServices(category);
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const handleAiMatch = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    setIsModalOpen(true);
    setMatchResult(null);
    
    try {
      const result = await getServiceProviderMatch(searchQuery);
      setMatchResult(result);
    } catch (error) {
      setMatchResult('Failed to get AI recommendation. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedService) return;
    
    try {
      const response = await servicesApi.bookService(selectedService.id, {
        notes: 'Service booking request',
        preferredDate: new Date().toISOString()
      });
      
      if (response.success) {
        alert('Service booked successfully! You will be contacted shortly.');
        setBookingModalOpen(false);
        setSelectedService(null);
      } else {
        alert('Failed to book service. Please try again.');
      }
    } catch (error) {
      alert('Booking failed. Please check your connection and try again.');
    }
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ServiceCard = ({ service }: { service: Service }) => (
    <div className="card hover:shadow-medium transition-all duration-300 group">
      {/* Service Image */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img 
          src={service.image || `https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400`} 
          alt={service.title} 
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
            <HeartIcon className="h-4 w-4 text-textSecondary hover:text-error" />
          </button>
          <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
            <ShareIcon className="h-4 w-4 text-textSecondary hover:text-primary" />
          </button>
        </div>
        {service.category && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-primary/90 text-white text-xs font-medium rounded-full">
              {service.category}
            </span>
          </div>
        )}
      </div>

      {/* Service Content */}
      <div className="space-y-3">
        {/* Title and Provider */}
        <div>
          <h3 className="text-xl font-bold text-textPrimary group-hover:text-primary transition-colors">
            {service.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-textSecondary">{t('byProvider')} {service.provider}</span>
            <VerifiedIcon className="h-4 w-4 text-primary" />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-textSecondary line-clamp-2">
          {service.description}
        </p>

        {/* Rating and Views */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <StarIcon className="h-4 w-4" />
            <span className="font-semibold text-warning">{service.rating}</span>
            <span className="text-xs text-textSecondary">(127 {t('reviews')})</span>
          </div>
          <div className="flex items-center gap-1 text-textSecondary text-xs">
            <EyeIcon className="h-3 w-3" />
            <span>234 {t('views')}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-textSecondary text-sm">
          <MapPinIcon className="h-4 w-4" />
          <span>{t('withinRadius')}</span>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <span className="text-2xl font-bold text-primary">₹{service.price}</span>
            <span className="text-sm text-textSecondary ml-1">{t('perService')}</span>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary text-sm px-3 py-2 flex items-center gap-1">
              <PhoneIcon className="h-3 w-3" />
              {t('call')}
            </button>
            <button 
              onClick={() => handleBookService(service)}
              className="btn btn-primary text-sm px-3 py-2 flex items-center gap-1"
            >
              <WalletIcon className="h-3 w-3" />
              {t('bookNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">{t('digitalHaat')}</h1>
        <p className="text-textSecondary mt-1">{t('findServices')}</p>
      </div>
      
      {/* Search and AI Match */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder={t('searchServices')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 pr-4"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon />
          </div>
        </div>
        <button 
          onClick={handleAiMatch}
          disabled={!searchQuery}
          className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SparklesIcon className="h-4 w-4" />
          {t('aiMatch')}
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <FilterIcon className="h-5 w-5 text-textSecondary flex-shrink-0" />
        <div className="flex gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-white shadow-medium'
                  : 'bg-white border border-border text-textSecondary hover:border-primary hover:text-primary'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌾</div>
          <h3 className="text-xl font-semibold text-textPrimary mb-2">{t('noServicesFound')}</h3>
          <p className="text-textSecondary">{t('adjustSearch')}</p>
        </div>
      )}

      {/* AI Match Result Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={t('aiServiceRecommendation')}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner />
          </div>
        ) : (
          matchResult && (
            typeof matchResult === 'string' ? (
              <div className="text-center py-6">
                <div className="text-error mb-3">⚠️</div>
                <p className="text-error">{matchResult}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary">{matchResult.providerName}</h3>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <StarIcon className="h-5 w-5" />
                    <span className="font-bold text-warning text-lg">{matchResult.rating}</span>
                    <span className="text-textSecondary">{t('rating')}</span>
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="font-semibold text-textPrimary mb-2">{t('whyThisMatch')}</h4>
                  <p className="text-textSecondary">{matchResult.reason}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <PhoneIcon className="h-4 w-4 text-primary" />
                    <span className="font-mono text-textPrimary">{matchResult.contact}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button className="btn btn-secondary flex-1">
                    {t('callProvider')}
                  </button>
                  <button className="btn btn-primary flex-1">
                    {t('startChat')}
                  </button>
                </div>
              </div>
            )
          )
        )}
      </Modal>

      {/* Booking Confirmation Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => {setBookingModalOpen(false); setSelectedService(null);}}
        title={t('confirmServiceBooking')}
      >
        {selectedService && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold">{selectedService.title}</h3>
              <p className="text-textSecondary">{t('byProvider')} {selectedService.provider}</p>
              <p className="text-2xl font-bold text-primary mt-2">₹{selectedService.price}</p>
            </div>
            
            <div className="bg-warning/10 p-4 rounded-lg border-l-4 border-warning">
              <p className="text-sm text-textSecondary">
                💡 <strong>{t('securePayment')}</strong> {t('escrowNote')}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {setBookingModalOpen(false); setSelectedService(null);}}
                className="btn btn-secondary flex-1"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleConfirmBooking}
                className="btn btn-primary flex-1"
              >
                {t('confirmPay')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ServiceMarketplace;
