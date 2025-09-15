import { en } from './en';
import { hi } from './hi';
import { gu } from './gu';

export const translations = {
  en,
  hi,
  gu,
} as const;

export type TranslationKey = keyof typeof en;
export type LanguageCode = keyof typeof translations;