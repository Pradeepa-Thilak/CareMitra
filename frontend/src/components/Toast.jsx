import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const typeConfig = {
    success: {
      bg: 'bg-success',
      icon: CheckCircle,
      text: 'text-white',
    },
    error: {
      bg: 'bg-danger',
      icon: AlertCircle,
      text: 'text-white',
    },
    info: {
      bg: 'bg-info',
      icon: Info,
      text: 'text-white',
    },
    warning: {
      bg: 'bg-warning',
      icon: AlertCircle,
      text: 'text-dark',
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.text} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="flex-shrink-0 hover:opacity-80 transition"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
