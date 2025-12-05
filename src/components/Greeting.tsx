import { Sunrise, Sun, Sunset, Moon, Sparkles } from 'lucide-react';

interface GreetingProps {
  name: string;
  showRole?: boolean;
  role?: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Greeting = ({ name, showRole, role, avatar, size = 'md' }: GreetingProps) => {
  const hour = new Date().getHours();
  
  let greeting = 'Boa noite';
  let Icon = Moon;
  let iconColor = 'text-indigo-400';
  let bgColor = 'from-indigo-500/20 to-purple-500/20';
  
  if (hour >= 6 && hour < 12) {
    greeting = 'Bom dia';
    Icon = Sunrise;
    iconColor = 'text-amber-400';
    bgColor = 'from-amber-500/20 to-orange-500/20';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Boa tarde';
    Icon = Sun;
    iconColor = 'text-orange-400';
    bgColor = 'from-orange-500/20 to-rose-500/20';
  } else if (hour >= 18 && hour < 22) {
    greeting = 'Boa noite';
    Icon = Sunset;
    iconColor = 'text-rose-400';
    bgColor = 'from-rose-500/20 to-purple-500/20';
  }

  const sizes = {
    sm: {
      wrapper: 'gap-3',
      avatar: 'w-10 h-10 text-xl',
      icon: 'w-4 h-4',
      name: 'text-base',
      role: 'text-xs',
      greeting: 'text-sm'
    },
    md: {
      wrapper: 'gap-4',
      avatar: 'w-12 h-12 text-2xl',
      icon: 'w-5 h-5',
      name: 'text-xl',
      role: 'text-sm',
      greeting: 'text-base'
    },
    lg: {
      wrapper: 'gap-5',
      avatar: 'w-16 h-16 text-3xl',
      icon: 'w-6 h-6',
      name: 'text-2xl',
      role: 'text-base',
      greeting: 'text-lg'
    }
  };

  const s = sizes[size];

  if (showRole && avatar) {
    return (
      <div className={`flex items-center ${s.wrapper}`}>
        {/* Avatar */}
        <div className="relative group">
          <div className={`${s.avatar} rounded-2xl bg-gradient-to-br ${bgColor} flex items-center justify-center border border-primary/10 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
            {avatar}
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-card animate-pulse" />
        </div>
        
        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`${s.greeting} text-muted-foreground`}>{greeting},</span>
            <div className={`p-1 rounded-lg bg-gradient-to-br ${bgColor}`}>
              <Icon className={`${s.icon} ${iconColor}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className={`${s.name} font-bold text-foreground`}>{name}</h1>
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
          {role && (
            <p className={`${s.role} text-muted-foreground`}>{role}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${s.wrapper}`}>
      <div className={`p-2 rounded-xl bg-gradient-to-br ${bgColor} border border-primary/10`}>
        <Icon className={`${s.icon} ${iconColor}`} />
      </div>
      <div>
        <span className={`${s.greeting} text-muted-foreground`}>{greeting}, </span>
        <span className={`${s.name} font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
          {name}
        </span>
      </div>
    </div>
  );
};