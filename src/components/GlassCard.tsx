import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'subtle';
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'glass-card p-6',
      elevated: 'glass-card p-6 shadow-premium-lg hover:shadow-glow transition-shadow duration-300',
      subtle: 'bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';