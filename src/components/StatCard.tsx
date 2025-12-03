import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  color?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend, color = 'text-primary' }: StatCardProps) => {
  const getColorClasses = () => {
    switch (color) {
      case 'text-primary':
        return {
          bg: 'bg-gradient-to-br from-primary/15 to-primary/5',
          border: 'border-primary/20',
          glow: 'group-hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]',
          icon: 'text-primary',
          ring: 'ring-primary/20'
        };
      case 'text-success':
        return {
          bg: 'bg-gradient-to-br from-success/15 to-success/5',
          border: 'border-success/20',
          glow: 'group-hover:shadow-[0_0_30px_-5px_hsl(var(--success)/0.3)]',
          icon: 'text-success',
          ring: 'ring-success/20'
        };
      case 'text-accent':
        return {
          bg: 'bg-gradient-to-br from-accent/15 to-accent/5',
          border: 'border-accent/20',
          glow: 'group-hover:shadow-[0_0_30px_-5px_hsl(var(--accent)/0.3)]',
          icon: 'text-accent',
          ring: 'ring-accent/20'
        };
      case 'text-warning':
        return {
          bg: 'bg-gradient-to-br from-warning/15 to-warning/5',
          border: 'border-warning/20',
          glow: 'group-hover:shadow-[0_0_30px_-5px_hsl(var(--warning)/0.3)]',
          icon: 'text-warning',
          ring: 'ring-warning/20'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-primary/15 to-primary/5',
          border: 'border-primary/20',
          glow: 'group-hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]',
          icon: color,
          ring: 'ring-primary/20'
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <GlassCard className={`animate-slideUp group hover:scale-[1.02] transition-all duration-300 ${colorClasses.glow} relative overflow-hidden`}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-accent/0 group-hover:from-primary/[0.03] group-hover:to-accent/[0.03] transition-all duration-500" />
      
      {/* Animated corner accent */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/80 mb-2">
            {title}
          </p>
          <p className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {value}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1.5 mt-3 text-sm font-semibold ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
              <div className={`p-1 rounded-full ${trend >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
                {trend >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
              </div>
              <span>
                {trend >= 0 ? '+' : ''}{Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        
        <div className={`relative p-3.5 rounded-2xl ${colorClasses.bg} border ${colorClasses.border} ring-1 ${colorClasses.ring}
                        transition-all duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3`}>
          <Icon className={`w-6 h-6 ${colorClasses.icon} transition-transform duration-300`} strokeWidth={2} />
        </div>
      </div>
    </GlassCard>
  );
};