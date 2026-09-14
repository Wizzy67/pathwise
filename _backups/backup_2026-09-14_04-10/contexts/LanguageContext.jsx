import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        // First try network
        const res = await api.get('/data/translations');
        setTranslations(res.data);
        localStorage.setItem('cachedTranslations', JSON.stringify(res.data));
      } catch (error) {
        // Fallback to cache if offline
        const cached = localStorage.getItem('cachedTranslations');
        if (cached) {
          setTranslations(JSON.parse(cached));
        }
      }
    };
    fetchTranslations();
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'pidgin' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const t = (key) => {
    if (!translations[language]) return key;
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
