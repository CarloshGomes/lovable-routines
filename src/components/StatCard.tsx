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
          bg: 'bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5',
          glow: 'shadow-lg shadow-primary/20',
          icon: 'text-primary'
        };
      case 'text-success':
        return {
          bg: 'bg-gradient-to-br from-success/20 via-success/10 to-success/5',
          glow: 'shadow-lg shadow-success/20',
          icon: 'text-success'
        };
      case 'text-accent':
        return {
          bg: 'bg-gradient-to-br from-accent/20 via-accent/10 to-accent/5',
          glow: 'shadow-lg shadow-accent/20',
          icon: 'text-accent'
        };
      case 'text-warning':
        return {
          bg: 'bg-gradient-to-br from-warning/20 via-warning/10 to-warning/5',
          glow: 'shadow-lg shadow-warning/20',
          icon: 'text-warning'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5',
          glow: 'shadow-lg shadow-primary/20',
          icon: color
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <GlassCard className="animate-slideUp group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground mb-2 opacity-80">
            {title}
          </p>
          <p className="text-4xl font-extrabold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent mb-1">
            {value}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1.5 mt-3 text-sm font-semibold ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 animate-bounce" />
              ) : (
                <TrendingDown className="w-4 h-4 animate-bounce" />
              )}
              <span className="flex items-center gap-0.5">
                {trend >= 0 ? '+' : ''}{Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        
        <div className={`relative p-4 rounded-2xl ${colorClasses.bg} ${colorClasses.glow} 
                        transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          {/* Icon glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Icon className={`w-7 h-7 ${colorClasses.icon} relative z-10 transition-transform duration-300 group-hover:scale-110`} strokeWidth={2.5} />
        </div>
      </div>
    </GlassCard>
  );
};
