import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { LANGUAGES, type Language } from '../constants';
import { translations, type TranslationKey, type LanguageCode } from '../translations';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (languageCode: string) => void;
  getCurrentLanguage: () => Language | undefined;
  getLanguageName: (languageCode?: string) => string;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('gu');

  // Load language from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage && LANGUAGES.find(lang => lang.code === savedLanguage)) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.warn('Failed to load language preference:', error);
    }
  }, []);

  const setLanguage = (languageCode: string) => {
    if (LANGUAGES.find(lang => lang.code === languageCode)) {
      setCurrentLanguage(languageCode);
      try {
        localStorage.setItem('selectedLanguage', languageCode);
      } catch (error) {
        console.warn('Failed to save language preference:', error);
      }
    }
  };

  const getCurrentLanguage = () => {
    return LANGUAGES.find(lang => lang.code === currentLanguage);
  };

  const getLanguageName = (languageCode?: string) => {
    const code = languageCode || currentLanguage;
    const language = LANGUAGES.find(lang => lang.code === code);
    return language ? language.name : 'English';
  };

  const t = useMemo(() => {
    return (key: TranslationKey): string => {
      const langCode = currentLanguage as LanguageCode;
      const currentTranslations = translations[langCode] || translations.en;
      return currentTranslations[key] || translations.en[key] || key;
    };
  }, [currentLanguage]);

  const value: LanguageContextType = useMemo(() => ({
    currentLanguage,
    setLanguage,
    getCurrentLanguage,
    getLanguageName,
    t,
  }), [currentLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};