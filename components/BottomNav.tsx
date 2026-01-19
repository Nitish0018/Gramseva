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
    className={`relative group flex flex-col items-center justify-center flex-1 py-3 px-1 transition-all duration-300 rounded-2xl mx-1 ${isActive
        ? 'text-primary bg-primary/10'
        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      }`}
    aria-label={label}
  >
    <div className={`transition-all duration-300 ${isActive ? '-translate-y-0.5 scale-110' : 'group-hover:-translate-y-0.5'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-bold mt-1 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-gray-400'
      }`}>
      {label}
    </span>
    {isActive && (
      <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full mb-0.5"></span>
    )}
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const { t } = useLanguage();

  const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'market', label: t('market'), icon: <MarketIcon className="h-6 w-6" /> },
    { page: 'services', label: t('services'), icon: <ServicesIcon className="h-6 w-6" /> },
    { page: 'advisory', label: t('advisory'), icon: <AdvisoryIcon className="h-6 w-6" /> },
    { page: 'chat', label: t('chat'), icon: <ChatIcon className="h-6 w-6" /> },
    { page: 'settings', label: t('settings'), icon: <SettingsIcon className="h-6 w-6" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/20 z-50 pb-safe">
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex justify-around items-end relative">
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
