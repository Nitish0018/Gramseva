
import React, { useState, useEffect, useRef } from 'react';
import { USER_PROFILE } from '../constants';
import { userApi, type UserProfile as BackendUserProfile } from '../services/backendService';
import { 
  StarIcon, 
  VerifiedIcon, 
  UploadIcon, 
  EditIcon,
  SettingsIcon,
  WalletIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  BellIcon,
  ClockIcon,
  CheckIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  UsersIcon,
  ActivityIcon
} from './icons';
import { useLanguage } from '../contexts/LanguageContext';

const Profile: React.FC = () => {
  const { t } = useLanguage();
  const [userProfile, setUserProfile] = useState(USER_PROFILE);
  const [backendProfile, setBackendProfile] = useState<BackendUserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    location: '',
    farmerType: '',
    village: '',
    state: '',
    city: '',
    country: ''
  });

  useEffect(() => {
    loadUserProfile();
    // Load locally saved avatar if present
    try {
      const saved = localStorage.getItem('userAvatar');
      if (saved) setLocalAvatar(saved);
    } catch {}
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await userApi.getProfile();
      if (response.success && response.data) {
        setBackendProfile(response.data);
        setEditForm({
          name: response.data.name,
          phone: response.data.phone,
          location: response.data.location,
          farmerType: response.data.farmerType,
          village: response.data.village || '',
          state: response.data.state || '',
          city: response.data.city || '',
          country: response.data.country || ''
        });
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const response = await userApi.updateProfile(editForm);
      if (response.success) {
        setBackendProfile(response.data!);
        setIsEditing(false);
      } else {
        alert(t('failedToUpdate'));
      }
    } catch (error) {
      alert(t('updateFailed'));
    }
    setIsLoading(false);
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(t('selectValidImage'));
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setLocalAvatar(dataUrl);
      try { localStorage.setItem('userAvatar', dataUrl); } catch {}
      // Try updating backend profile as well (mock backend supports merging)
      try {
        const resp = await userApi.updateProfile({ avatar: dataUrl });
        if (resp.success && resp.data) setBackendProfile(resp.data);
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  const displayProfile = backendProfile || userProfile;
  const { name, village, avatarUrl, rating, reviews, kycVerified, memberSince } = userProfile;

  const ProfileStat = ({ icon, label, value, color = "text-textPrimary" }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color?: string;
  }) => (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-border">
      <div className="p-2 bg-primary/10 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-xs text-textSecondary uppercase tracking-wide">{label}</p>
        <p className={`font-semibold ${color}`}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">{t('myProfile')}</h1>
          <p className="text-textSecondary mt-1">{t('manageAccount')}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-primary flex items-center gap-2"
          >
            <EditIcon className="h-4 w-4" />
            {isEditing ? t('cancel') : t('edit')}
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            {t('settings')}
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/10 rounded-lg">
              <WalletIcon className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">{t('walletBalance')}</p>
              <p className="text-2xl font-bold text-success">₹12,540</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning/10 rounded-lg">
              <StarIcon className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">{t('rating')}</p>
              <p className="text-2xl font-bold text-warning">{rating}/5.0</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CheckIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">{t('completedDeals')}</p>
              <p className="text-2xl font-bold text-primary">45</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-info/10 rounded-lg">
              <ActivityIcon className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">{t('activeSince')}</p>
              <p className="text-2xl font-bold text-info">2 {t('years')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Section */}
          <div className="relative">
            <img 
              src={localAvatar || displayProfile.avatar || avatarUrl} 
              alt={displayProfile.name || name} 
              className="w-32 h-32 rounded-full border-4 border-primary shadow-medium object-cover" 
            />
            {/* Upload button with black text */}
            <button 
              onClick={handleAvatarButtonClick}
              className="absolute bottom-2 right-2 p-2 bg-primary text-black rounded-full shadow-medium hover:bg-primaryDark transition-colors">
              <UploadIcon className="h-4 w-4" />
            </button>
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelected}
              className="hidden"
            />
            {kycVerified && (
              <div className="absolute -top-2 -right-2 p-1 bg-success rounded-full">
                <VerifiedIcon className="h-4 w-4 text-black" />
              </div>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">{t('name')}</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">{t('phone')}</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">{t('location')}</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="input"
                    />
                  </div>
                </div>
                
                {/* Address Fields */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-textPrimary">{t('addressDetails')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">{t('village')}</label>
                      <input
                        type="text"
                        value={editForm.village}
                        onChange={(e) => setEditForm({...editForm, village: e.target.value})}
                        className="input"
                        placeholder={t('enterVillageName')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">{t('city')}</label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                        className="input"
                        placeholder={t('enterCityName')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">{t('state')}</label>
                      <input
                        type="text"
                        value={editForm.state}
                        onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                        className="input"
                        placeholder={t('enterStateName')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">{t('country')}</label>
                      <input
                        type="text"
                        value={editForm.country}
                        onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                        className="input"
                        placeholder={t('enterCountryName')}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">{t('farmerType')}</label>
                  <select
                    value={editForm.farmerType}
                    onChange={(e) => setEditForm({...editForm, farmerType: e.target.value})}
                    className="input"
                  >
                    <option value="small">{t('smallScaleFarmer')}</option>
                    <option value="medium">{t('mediumScaleFarmer')}</option>
                    <option value="large">{t('largeScaleFarmer')}</option>
                    <option value="organic">{t('organicFarmer')}</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <CheckIcon className="h-4 w-4" />
                    {isLoading ? t('saving') : t('saveChanges')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-textPrimary">{displayProfile.name || name}</h2>
                  <p className="text-textSecondary">{displayProfile.location || village}</p>
                  <p className="text-sm text-textSecondary capitalize">{displayProfile.farmerType || t('smallScaleFarmer')}</p>
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-5 w-5" />
                    <span className="font-bold text-black">{rating}</span>
                    <span className="text-black">({reviews} {t('reviews')})</span>
                  </div>
                  {kycVerified && (
                    <div className="flex items-center gap-1 text-success">
                      <VerifiedIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{t('verified')}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-textSecondary">
                  <div className="flex items-center gap-1">
                    <PhoneIcon className="h-4 w-4" />
                    <span className="text-black">{displayProfile.phone || '+91 98765 43210'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MailIcon className="h-4 w-4" />
                    <span className="text-black">{displayProfile.email || 'farmer@gramseva.com'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="text-black">{t('memberSince')} {memberSince}</span>
                  </div>
                </div>

                {/* Address Information Display */}
                {(displayProfile.village || displayProfile.city || displayProfile.state || displayProfile.country) && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-textPrimary mb-2 flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      {t('addressDetails')}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-textSecondary">
                      {displayProfile.village && (
                        <div>
                          <span className="font-medium">{t('village')}:</span> {displayProfile.village}
                        </div>
                      )}
                      {displayProfile.city && (
                        <div>
                          <span className="font-medium">{t('city')}:</span> {displayProfile.city}
                        </div>
                      )}
                      {displayProfile.state && (
                        <div>
                          <span className="font-medium">{t('state')}:</span> {displayProfile.state}
                        </div>
                      )}
                      {displayProfile.country && (
                        <div>
                          <span className="font-medium">{t('country')}:</span> {displayProfile.country}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="card">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-semibold text-textPrimary mb-2">{t('accountVerification')}</h3>
            {kycVerified ? (
              <div className="flex items-center gap-2 text-success">
                <VerifiedIcon className="h-5 w-5" />
                <span className="font-medium text-black">{t('fullyVerified')}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-warning">
                  <BellIcon className="h-5 w-5" />
                  <span className="font-medium">{t('verificationPending')}</span>
                </div>
                <p className="text-sm text-textSecondary">
                  {t('completeKycMessage')}
                </p>
              </div>
            )}
          </div>
          {!kycVerified && (
            <button className="btn btn-primary flex items-center gap-2">
              <UploadIcon className="h-4 w-4" />
              {t('completeKyc')}
            </button>
          )}
        </div>

        {!kycVerified && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
              <CheckIcon className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-success">{t('phoneVerified')}</p>
                <p className="text-xs text-textSecondary">{t('mobileConfirmed')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
              <ClockIcon className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-warning">{t('documentsPending')}</p>
                <p className="text-xs text-textSecondary">{t('uploadIdProof')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
              <BellIcon className="h-5 w-5 text-textSecondary" />
              <div>
                <p className="font-medium text-textSecondary">{t('bankDetails')}</p>
                <p className="text-xs text-textSecondary">{t('notAdded')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Developer Options */}
      <div className="card">
        <h3 className="text-lg font-semibold text-textPrimary mb-4">{t('quickActions')}</h3>
        <div className="space-y-3">
          <div 
            onClick={() => {
              // Simple admin access - in production, this should be more secure
              window.location.hash = '#admin';
            }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <SettingsIcon className="h-5 w-5 text-textSecondary" />
              <span className="text-textPrimary">{t('adminPanelAccess')}</span>
            </div>
            <span className="text-xs text-textSecondary">{t('tapToAccess')}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-textPrimary mb-4">{t('recentTransactions')}</h3>
        <div className="space-y-3">
          {[
            { type: 'payment', desc: 'Tractor Rental from Ramesh', amount: '-₹2,800', date: '2 days ago', status: 'completed' },
            { type: 'received', desc: 'Harvest Labor Payment', amount: '+₹5,000', date: '5 days ago', status: 'completed' },
            { type: 'payment', desc: 'Seed Purchase - Krishna Seeds', amount: '-₹1,200', date: '1 week ago', status: 'completed' },
            { type: 'received', desc: 'Crop Sale to AgriCorp', amount: '+₹15,000', date: '2 weeks ago', status: 'completed' }
          ].map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'received' ? 'bg-success/10' : 'bg-error/10'
                }`}>
                  <WalletIcon className={`h-4 w-4 ${
                    transaction.type === 'received' ? 'text-success' : 'text-error'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-textPrimary">{transaction.desc}</p>
                  <p className="text-xs text-textSecondary">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${
                  transaction.type === 'received' ? 'text-success' : 'text-error'
                }`}>
                  {transaction.amount}
                </p>
                <div className="flex items-center gap-1">
                  <CheckIcon className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">{t('completed')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="mt-4 w-full btn btn-secondary">
          {t('viewAllTransactions')}
        </button>
      </div>
    </div>
  );
};

export default Profile;
