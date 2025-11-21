import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast, ToastType } from '@/contexts/ToastContext';

const toastStyles: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-success text-success-foreground',
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  error: {
    bg: 'bg-danger text-danger-foreground',
    icon: <AlertCircle className="w-5 h-5" />,
  },
  warning: {
    bg: 'bg-warning text-warning-foreground',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  info: {
    bg: 'bg-primary text-primary-foreground',
    icon: <Info className="w-5 h-5" />,
  },
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slideInRight ${toastStyles[toast.type].bg}`}
        >
          {toastStyles[toast.type].icon}
          <span className="flex-1 font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
