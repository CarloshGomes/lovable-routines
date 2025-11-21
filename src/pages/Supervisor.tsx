import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/Button';
import { 
  LayoutDashboard, Users, Calendar, Settings, LogOut
} from 'lucide-react';
import Dashboard from '@/components/supervisor/Dashboard';
import TeamManager from '@/components/supervisor/TeamManager';
import RoutineEditor from '@/components/supervisor/RoutineEditor';
import SettingsPanel from '@/components/supervisor/SettingsPanel';

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
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulseSlow" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulseSlow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gradient">Painel Supervisor</h1>
              <p className="text-sm text-muted-foreground">Gestão completa do sistema</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="glass border-b border-border sticky top-[73px] z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
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
