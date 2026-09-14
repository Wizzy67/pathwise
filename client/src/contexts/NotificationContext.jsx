import { createContext, useContext, useState, useCallback } from 'react';
import { useModal } from './ModalContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { alert } = useModal();

  const addNotification = useCallback((message, type = 'info', options = {}) => {
    // Map notification types to the modern modal variants
    let variant = 'brand';
    let title = 'Notice';
    let confirmText = 'Got it';

    if (type === 'error') {
      variant = 'danger';
      title = options.title || 'There is a problem';
      confirmText = options.confirmText || 'Dismiss';
    } else if (type === 'success') {
      variant = 'success';
      title = options.title || 'Success!';
      confirmText = options.confirmText || 'Continue';
    } else if (type === 'warning') {
      variant = 'warning';
      title = options.title || 'Notice';
      confirmText = options.confirmText || 'Understood';
    } else {
      variant = 'brand';
      title = options.title || 'Information';
      confirmText = options.confirmText || 'Got it';
    }

    // Launch the centered modern modal popup
    alert({
      title,
      message,
      variant,
      confirmText,
      autoClose: options.autoClose !== undefined ? options.autoClose : (type === 'success' ? 3200 : null),
    });
  }, [alert]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
