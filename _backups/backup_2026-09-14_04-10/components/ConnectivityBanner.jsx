import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const ConnectivityBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { t } = useLanguage();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-pw-blue text-white font-semibold py-2 px-4 flex items-center justify-center gap-2 shadow-lg"
        >
          <WifiOff className="w-5 h-5" />
          <span>{t('offline_mode') || 'You are currently offline. Limited features available.'}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectivityBanner;
