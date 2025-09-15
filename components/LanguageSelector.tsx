import React from 'react';
import { LANGUAGES, type Language } from '../constants';
import Modal from './Modal';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onLanguageSelect: (languageCode: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageSelect
}) => {
  const { t } = useLanguage();

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageSelect(languageCode);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('selectLanguage')} / भाषा चुनें`}
    >
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageSelect(language.code)}
            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
              currentLanguage === language.code
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-white border-gray-200 hover:bg-gray-50 text-textPrimary'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{language.flag}</span>
              <div className="text-left">
                <p className="font-medium">{language.name}</p>
                <p className="text-sm text-textSecondary">{language.nativeName}</p>
              </div>
            </div>
            {currentLanguage === language.code && (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>✅ Gujarati language support is now fully implemented!</strong> Select Gujarati (ગુજરાતી) to switch the interface language immediately.
        </p>
      </div>
    </Modal>
  );
};

export default LanguageSelector;