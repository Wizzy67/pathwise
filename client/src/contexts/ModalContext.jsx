import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Trash2,
  LogOut,
  CheckCircle2,
  Info,
  RotateCcw,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger', // 'danger' | 'brand' | 'warning' | 'success' | 'info'
    icon: null,
    isAlert: false,
    onConfirm: null,
    onCancel: null,
  });

  const resolverRef = useRef(null);

  const closeModal = useCallback(() => {
    setModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (modal.onConfirm) modal.onConfirm();
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
    closeModal();
  }, [modal, closeModal]);

  const handleCancel = useCallback(() => {
    if (modal.onCancel) modal.onCancel();
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
    closeModal();
  }, [modal, closeModal]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modal.isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [modal.isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modal.isOpen) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal.isOpen, handleCancel]);

  /**
   * openConfirm(options)
   * Returns a Promise<boolean> that resolves to true if confirmed, false if cancelled.
   */
  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setModal({
        isOpen: true,
        title: options.title || 'Are you sure?',
        message: options.message || '',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText !== undefined ? options.cancelText : 'Cancel',
        variant: options.variant || 'danger',
        icon: options.icon || null,
        isAlert: false,
        onConfirm: options.onConfirm || null,
        onCancel: options.onCancel || null,
      });
    });
  }, []);

  /**
   * openAlert(options)
   * Informational modal with a single acknowledgement button. Returns Promise<void>.
   */
  const alert = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setModal({
        isOpen: true,
        title: options.title || 'Notice',
        message: options.message || '',
        confirmText: options.confirmText || 'Got it',
        cancelText: null,
        variant: options.variant || 'brand',
        icon: options.icon || null,
        isAlert: true,
        onConfirm: options.onConfirm || null,
        onCancel: options.onCancel || null,
      });
    });
  }, []);

  // Icon resolver
  const renderIcon = () => {
    if (modal.icon && typeof modal.icon !== 'string') {
      const CustomIcon = modal.icon;
      return <CustomIcon className="w-6 h-6" />;
    }

    const iconKey = typeof modal.icon === 'string' ? modal.icon.toLowerCase() : null;

    if (iconKey === 'trash' || iconKey === 'delete') return <Trash2 className="w-6 h-6" />;
    if (iconKey === 'logout') return <LogOut className="w-6 h-6" />;
    if (iconKey === 'rotate' || iconKey === 'reset' || iconKey === 'retake') return <RotateCcw className="w-6 h-6" />;
    if (iconKey === 'check' || iconKey === 'success') return <CheckCircle2 className="w-6 h-6" />;
    if (iconKey === 'info') return <Info className="w-6 h-6" />;
    if (iconKey === 'help') return <HelpCircle className="w-6 h-6" />;

    // Fallback based on variant
    switch (modal.variant) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6" />;
      case 'success':
        return <CheckCircle2 className="w-6 h-6" />;
      case 'brand':
      case 'info':
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  // Color theme per variant
  const getVariantStyles = () => {
    switch (modal.variant) {
      case 'danger':
        return {
          iconBadge: 'bg-red-50 text-red-600 border border-red-100 shadow-sm shadow-red-500/10',
          confirmBtn: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm shadow-red-500/25 focus:ring-red-500',
        };
      case 'warning':
        return {
          iconBadge: 'bg-amber-50 text-amber-600 border border-amber-100 shadow-sm shadow-amber-500/10',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-sm shadow-amber-500/25 focus:ring-amber-500',
        };
      case 'success':
        return {
          iconBadge: 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-500/10',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-500/25 focus:ring-emerald-500',
        };
      case 'brand':
      default:
        return {
          iconBadge: 'bg-[#EEF2F9] text-[#20428B] border border-[#CBD5E1]/60 shadow-sm shadow-[#20428B]/10',
          confirmBtn: 'bg-[#20428B] hover:bg-[#1A346C] active:bg-[#152a57] text-white shadow-sm shadow-[#20428B]/25 focus:ring-[#20428B]',
        };
    }
  };

  const styles = getVariantStyles();

  // Portal into document.body to avoid parent CSS transforms or z-index stacking issues
  const modalPortal = (
    <AnimatePresence>
      {modal.isOpen && (
        <motion.div
          key="modal-portal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop overlay */}
          <div
            onClick={handleCancel}
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-[3px]"
          />

          {/* Modal Card */}
          <motion.div
            key="modal-portal-card"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className="relative w-full max-w-[360px] bg-white rounded-3xl p-6 sm:p-7 text-center shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] border border-slate-100/90 z-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Centered Top Icon Badge */}
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 transition-transform ${styles.iconBadge}`}>
              {renderIcon()}
            </div>

            {/* Title */}
            <h3
              id="modal-title"
              className="text-[19px] font-bold text-slate-900 tracking-tight font-heading leading-snug"
            >
              {modal.title}
            </h3>

            {/* Description */}
            {modal.message && (
              <p className="text-[13.5px] text-slate-500 mt-2 mb-6 leading-relaxed font-normal px-1">
                {modal.message}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-1">
              {!modal.isAlert && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 active:scale-[0.98] cursor-pointer"
                >
                  {modal.cancelText}
                </button>
              )}

              <button
                type="button"
                autoFocus
                onClick={handleConfirm}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] cursor-pointer ${styles.confirmBtn}`}
              >
                {modal.confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <ModalContext.Provider value={{ confirm, alert, closeModal }}>
      {children}
      {typeof document !== 'undefined' ? createPortal(modalPortal, document.body) : modalPortal}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export default ModalContext;
