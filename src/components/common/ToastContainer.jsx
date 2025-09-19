import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <FiCheck className="w-5 h-5" />;
      case 'error': return <FiAlertCircle className="w-5 h-5" />;
      case 'warning': return <FiAlertTriangle className="w-5 h-5" />;
      case 'info': return <FiInfo className="w-5 h-5" />;
      default: return <FiInfo className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`flex items-center p-4 rounded-lg border shadow-lg max-w-sm ${getStyles()}`}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
          }}
          className="ml-4 flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const { message, type = 'info', duration = 5000 } = event.detail;
      const id = Date.now() + Math.random();
      
      setToasts(prev => [...prev, { id, message, type, duration }]);
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

export default ToastContainer;