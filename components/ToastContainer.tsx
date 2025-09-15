import React, { useState, useEffect } from 'react';
import { CheckIcon, CloseIcon, AlertIcon, InfoIcon } from './icons';
import { notificationService, type ToastMessage } from '../services/notificationService';

interface ToastProps {
  toast: ToastMessage;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto close if duration is set
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckIcon className="h-5 w-5 text-green-600" />;
      case 'error':
        return <CloseIcon className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <InfoIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out max-w-md w-full
        ${isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
    >
      <div className={`
        border rounded-lg shadow-lg p-4 backdrop-blur-sm
        ${getToastStyles()}
      `}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">{toast.title}</h4>
            <p className="text-sm opacity-90 mt-1">{toast.message}</p>
            
            {toast.actions && toast.actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {toast.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="text-xs font-medium px-3 py-1 rounded-md bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const subscriberId = 'toast-container';
    
    notificationService.subscribeToToasts(subscriberId, (toast) => {
      setToasts(prev => [...prev, toast]);
    });

    return () => {
      notificationService.unsubscribeFromToasts(subscriberId);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
