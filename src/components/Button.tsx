import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 font-semibold rounded-xl 
      transition-all duration-200 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
      active:scale-[0.98]
    `;
    
    const variants = {
      primary: `
        bg-gradient-to-br from-primary to-primary-dark text-primary-foreground 
        hover:from-primary-light hover:to-primary 
        shadow-md hover:shadow-lg hover:shadow-primary/25
        hover:-translate-y-0.5
      `,
      secondary: `
        bg-secondary text-secondary-foreground 
        hover:bg-muted border border-border/50
        hover:border-border
      `,
      success: `
        bg-gradient-to-br from-success to-success-light text-success-foreground 
        shadow-md hover:shadow-lg hover:shadow-success/25
        hover:-translate-y-0.5
      `,
      danger: `
        bg-gradient-to-br from-danger to-danger-light text-danger-foreground 
        shadow-md hover:shadow-lg hover:shadow-danger/25
        hover:-translate-y-0.5
      `,
      warning: `
        bg-gradient-to-br from-warning to-warning-light text-warning-foreground 
        shadow-md hover:shadow-lg hover:shadow-warning/25
        hover:-translate-y-0.5
      `,
      ghost: `
        hover:bg-muted text-foreground
        hover:text-foreground
      `,
      outline: `
        border-2 border-border bg-transparent text-foreground
        hover:bg-muted hover:border-primary/30
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
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