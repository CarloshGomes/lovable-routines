import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary-light shadow-md hover:shadow-lg',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-muted',
      success: 'bg-success text-success-foreground hover:bg-success-light shadow-md hover:shadow-lg',
      danger: 'bg-danger text-danger-foreground hover:bg-danger-light shadow-md hover:shadow-lg',
      warning: 'bg-warning text-warning-foreground hover:bg-warning-light shadow-md hover:shadow-lg',
      ghost: 'hover:bg-muted text-foreground',
      outline: 'border-2 border-border hover:bg-muted text-foreground',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
