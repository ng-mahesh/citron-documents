import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      borderColor: 'border-emerald-400',
      textColor: 'text-white',
      iconColor: 'text-emerald-100',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
      borderColor: 'border-red-400',
      textColor: 'text-white',
      iconColor: 'text-red-100',
    },
    info: {
      icon: AlertCircle,
      bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
      borderColor: 'border-blue-400',
      textColor: 'text-white',
      iconColor: 'text-blue-100',
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-slide-in-right">
      <div
        className={`${bgColor} ${textColor} px-6 py-4 rounded-xl shadow-2xl border-2 ${borderColor} min-w-[320px] max-w-md backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <Icon className={`h-6 w-6 ${iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className="font-semibold text-base leading-tight">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/40 rounded-full animate-progress"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toast: { message: string; type: ToastType } | null;
  onClose: () => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return <Toast message={toast.message} type={toast.type} onClose={onClose} />;
};
