import { Sunrise, Sun, Sunset, Moon } from 'lucide-react';

export const Greeting = ({ name }: { name: string }) => {
  const hour = new Date().getHours();
  
  let greeting = 'Boa noite';
  let Icon = Moon;
  
  if (hour >= 6 && hour < 12) {
    greeting = 'Bom dia';
    Icon = Sunrise;
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Boa tarde';
    Icon = Sun;
  } else if (hour >= 18 && hour < 22) {
    greeting = 'Boa noite';
    Icon = Sunset;
  }

  return (
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-primary" />
      <span className="text-lg font-medium">
        {greeting}, <span className="text-gradient">{name}</span>!
      </span>
    </div>
  );
};
