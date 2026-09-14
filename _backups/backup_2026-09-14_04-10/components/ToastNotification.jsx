import { useNotification } from '../contexts/NotificationContext';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastNotification = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-pw-blue" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-pw-blue" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {notifications.map(note => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-pw-surface border border-pw-white/10 shadow-lg rounded-xl p-4 flex items-start gap-3 min-w-[300px] max-w-sm backdrop-blur-md"
          >
            <div className="shrink-0 mt-0.5">{getIcon(note.type)}</div>
            <p className="text-sm flex-1 text-pw-white font-medium">{note.message}</p>
            <button 
              onClick={() => removeNotification(note.id)}
              className="shrink-0 text-pw-gray hover:text-pw-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotification;
