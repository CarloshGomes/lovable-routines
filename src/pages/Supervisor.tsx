import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/Button';
import { 
  LayoutDashboard, Users, Calendar, Settings, LogOut, ShieldCheck, Activity
} from 'lucide-react';
import Dashboard from '@/components/supervisor/Dashboard';
import TeamManager from '@/components/supervisor/TeamManager';
import RoutineEditor from '@/components/supervisor/RoutineEditor';
import SettingsPanel from '@/components/supervisor/SettingsPanel';
import logoImage from '@/assets/logo.svg';

type Tab = 'dashboard' | 'team' | 'routines' | 'settings';

const Supervisor = () => {
  const navigate = useNavigate();
  const { logout } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'team' as Tab, label: 'Equipe', icon: Users },
    { id: 'routines' as Tab, label: 'Rotinas', icon: Calendar },
    { id: 'settings' as Tab, label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-background to-purple-500/5" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float opacity-60" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float opacity-50" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-2xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={logoImage} alt="Logo" className="w-10 h-10 object-contain" />
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-lg" />
              </div>
              
              <div className="h-8 w-px bg-border/50" />
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                    Painel Supervisor
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-3.5 h-3.5 text-success" />
                    <span>Gestão completa do sistema</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Logout */}
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="shadow-lg shadow-danger/20"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-[73px] z-30 bg-card/60 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2.5 px-5 py-3.5 whitespace-nowrap transition-all duration-300 rounded-xl ${
                    isActive
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <tab.icon className={`w-4.5 h-4.5 ${isActive ? 'text-primary' : ''}`} />
                  <span>{tab.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-primary via-primary to-accent rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'team' && <TeamManager />}
        {activeTab === 'routines' && <RoutineEditor />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
};

export default Supervisor;