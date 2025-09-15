import React, { useState } from 'react';
import { 
  SettingsIcon,
  ProfileIcon,
  BellIcon,
  ShieldIcon,
  InfoIcon,
  ChevronRightIcon,
  GlobeIcon,
  NotificationIcon,
  LogoutIcon
} from './icons';
import { USER_PROFILE, LANGUAGES } from '../constants';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsProps {
  onNavigateToProfile?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigateToProfile }) => {
  const { currentLanguage, setLanguage, getLanguageName, t } = useLanguage();
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    serviceUpdates: true,
    weatherAlerts: true,
    marketNews: true,
  });
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode);
  };

  const SettingItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onClick?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
  }> = ({ icon, title, subtitle, onClick, rightElement, showArrow = true }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <div className="text-left">
          <p className="font-medium text-textPrimary">{title}</p>
          {subtitle && <p className="text-sm text-textSecondary">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {rightElement}
        {showArrow && <ChevronRightIcon className="h-5 w-5 text-textSecondary" />}
      </div>
    </button>
  );

  const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (enabled?: boolean) => void;
  }> = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-lg font-semibold text-textPrimary mb-3 mt-6 first:mt-0">{title}</h2>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-textPrimary">{t('settingsTitle')}</h1>
          </div>
        </div>

        {/* Profile Section */}
        <SectionHeader title={t('account')} />
        <div className="space-y-3 mb-6">
          <SettingItem
            icon={<ProfileIcon className="h-6 w-6 text-primary" />}
            title={t('profileSettings')}
            subtitle={`${USER_PROFILE.name} • ${USER_PROFILE.village}`}
            onClick={onNavigateToProfile || (() => console.log('Navigate to profile settings'))}
          />
          
          <SettingItem
            icon={<ShieldIcon className="h-6 w-6 text-primary" />}
            title={t('accountSecurity')}
            subtitle={t('securitySubtitle')}
            onClick={() => console.log('Navigate to security settings')}
          />
        </div>

        {/* App Preferences */}
        <SectionHeader title={t('appPreferences')} />
        <div className="space-y-3 mb-6">
          <SettingItem
            icon={<GlobeIcon className="h-6 w-6 text-primary" />}
            title={t('language')}
            subtitle={getLanguageName()}
            onClick={() => setIsLanguageModalOpen(true)}
          />
        </div>

        {/* Notifications */}
        <SectionHeader title={t('notifications')} />
        <div className="space-y-3 mb-6">
          <SettingItem
            icon={<BellIcon className="h-6 w-6 text-primary" />}
            title={t('priceAlerts')}
            subtitle={t('priceAlertsSubtitle')}
            rightElement={
              <ToggleSwitch
                enabled={notifications.priceAlerts}
                onChange={(enabled) => 
                  setNotifications(prev => ({ ...prev, priceAlerts: enabled }))
                }
              />
            }
            showArrow={false}
          />
          
          <SettingItem
            icon={<NotificationIcon className="h-6 w-6 text-primary" />}
            title={t('serviceUpdates')}
            subtitle={t('serviceUpdatesSubtitle')}
            rightElement={
              <ToggleSwitch
                enabled={notifications.serviceUpdates}
                onChange={(enabled) => 
                  setNotifications(prev => ({ ...prev, serviceUpdates: enabled }))
                }
              />
            }
            showArrow={false}
          />
          
          <SettingItem
            icon={<BellIcon className="h-6 w-6 text-primary" />}
            title={t('weatherAlerts')}
            subtitle={t('weatherAlertsSubtitle')}
            rightElement={
              <ToggleSwitch
                enabled={notifications.weatherAlerts}
                onChange={(enabled) => 
                  setNotifications(prev => ({ ...prev, weatherAlerts: enabled }))
                }
              />
            }
            showArrow={false}
          />
          
          <SettingItem
            icon={<NotificationIcon className="h-6 w-6 text-primary" />}
            title={t('marketNews')}
            subtitle={t('marketNewsSubtitle')}
            rightElement={
              <ToggleSwitch
                enabled={notifications.marketNews}
                onChange={(enabled) => 
                  setNotifications(prev => ({ ...prev, marketNews: enabled }))
                }
              />
            }
            showArrow={false}
          />
        </div>

        {/* Privacy & Legal */}
        <SectionHeader title={t('privacyLegal')} />
        <div className="space-y-3 mb-6">
          <SettingItem
            icon={<ShieldIcon className="h-6 w-6 text-primary" />}
            title={t('privacyPolicy')}
            subtitle={t('privacyPolicySubtitle')}
            onClick={() => console.log('Open privacy policy')}
          />
          
          <SettingItem
            icon={<InfoIcon className="h-6 w-6 text-primary" />}
            title={t('termsOfService')}
            subtitle={t('termsOfServiceSubtitle')}
            onClick={() => console.log('Open terms of service')}
          />
        </div>

        {/* About */}
        <SectionHeader title={t('about')} />
        <div className="space-y-3 mb-6">
          <SettingItem
            icon={<InfoIcon className="h-6 w-6 text-primary" />}
            title={t('appVersion')}
            subtitle="GramSeva v1.0.0"
            showArrow={false}
          />
          
          <SettingItem
            icon={<InfoIcon className="h-6 w-6 text-primary" />}
            title={t('helpSupport')}
            subtitle={t('helpSupportSubtitle')}
            onClick={() => console.log('Open help & support')}
          />
        </div>

        {/* Sign Out */}
        <div className="space-y-3 mb-8">
          <button className="w-full flex items-center justify-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 hover:bg-red-100 transition-colors">
            <LogoutIcon className="h-6 w-6" />
            <span className="font-medium">{t('signOut')}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-textSecondary pb-8">
          <p>{t('appName')} - {t('tagline')}</p>
          <p className="mt-1">{t('madeWithLove')}</p>
        </div>
      </div>

      <LanguageSelector
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        currentLanguage={currentLanguage}
        onLanguageSelect={handleLanguageSelect}
      />
    </div>
  );
};

export default Settings;