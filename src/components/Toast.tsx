import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast, ToastType } from '@/contexts/ToastContext';

const toastStyles: Record<ToastType, { 
  bg: string; 
  border: string;
  icon: React.ReactNode;
  iconBg: string;
}> = {
  success: {
    bg: 'bg-card/95 dark:bg-card/95',
    border: 'border-success/30',
    icon: <CheckCircle2 className="w-5 h-5 text-success" />,
    iconBg: 'bg-success/10',
  },
  error: {
    bg: 'bg-card/95 dark:bg-card/95',
    border: 'border-danger/30',
    icon: <AlertCircle className="w-5 h-5 text-danger" />,
    iconBg: 'bg-danger/10',
  },
  warning: {
    bg: 'bg-card/95 dark:bg-card/95',
    border: 'border-warning/30',
    icon: <AlertTriangle className="w-5 h-5 text-warning" />,
    iconBg: 'bg-warning/10',
  },
  info: {
    bg: 'bg-card/95 dark:bg-card/95',
    border: 'border-primary/30',
    icon: <Info className="w-5 h-5 text-primary" />,
    iconBg: 'bg-primary/10',
  },
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3.5 rounded-xl 
            backdrop-blur-xl shadow-premium-lg border
            animate-slideInRight
            ${toastStyles[toast.type].bg}
            ${toastStyles[toast.type].border}
          `}
        >
          <div className={`p-2 rounded-lg ${toastStyles[toast.type].iconBg}`}>
            {toastStyles[toast.type].icon}
          </div>
          <span className="flex-1 font-medium text-foreground text-sm">
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};