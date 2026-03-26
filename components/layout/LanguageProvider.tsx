'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '@/i18n/config';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const initLang = async () => {
      const saved = localStorage.getItem('nyayasetu_lang') as Language;
      if (saved && (saved === 'en' || saved === 'hi')) {
        setLanguage(saved);
        await i18n.changeLanguage(saved);
      }
      setIsClient(true);
    };
    initLang();
  }, []);

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    i18n.changeLanguage(nextLang);
    localStorage.setItem('nyayasetu_lang', nextLang);
  };

  // Only render children when client-side mounted to prevent hydration errors
  if (!isClient) return null;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
