import React from 'react';
import type { Page } from '../types';
import { MarketIcon, ServicesIcon, ChatIcon, ProfileIcon, AdvisoryIcon, SettingsIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-3 pb-2 px-2 transition-all duration-300 rounded-lg mx-1 ${
      isActive 
        ? 'text-primary bg-primary/10 shadow-sm' 
        : 'text-textSecondary hover:text-primary hover:bg-primary/5'
    }`}
    aria-label={label}
  >
    <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
      {icon}
    </div>
    <span className={`text-xs mt-1 font-medium transition-all duration-200 ${
      isActive ? 'text-primary' : 'text-textSecondary group-hover:text-primary'
    }`}>
      {label}
    </span>
    {isActive && (
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
    )}
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const { t } = useLanguage();

  const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'market', label: t('market'), icon: <MarketIcon className="h-5 w-5" /> },
    { page: 'services', label: t('services'), icon: <ServicesIcon className="h-5 w-5" /> },
    { page: 'advisory', label: t('advisory'), icon: <AdvisoryIcon className="h-5 w-5" /> },
    { page: 'chat', label: t('chat'), icon: <ChatIcon className="h-5 w-5" /> },
    { page: 'settings', label: t('settings'), icon: <SettingsIcon className="h-5 w-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg shadow-strong border-t border-border z-50">
      <div className="max-w-4xl mx-auto px-2 py-2">
        <div className="flex justify-around items-center relative">
          {navItems.map((item) => (
            <NavItem
              key={item.page}
              label={item.label}
              icon={item.icon}
              isActive={activePage === item.page}
              onClick={() => setActivePage(item.page)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
