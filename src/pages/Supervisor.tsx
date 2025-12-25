import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/Button';

import { SupervisorHeader } from '@/components/supervisor/SupervisorHeader';
import Dashboard from '@/components/supervisor/Dashboard';
import TeamManager from '@/components/supervisor/TeamManager';
import RoutineEditor from '@/components/supervisor/RoutineEditor';
import SettingsPanel from '@/components/supervisor/SettingsPanel';
import { AnalyticsView } from '@/components/supervisor/AnalyticsView';
import { SUPERVISOR_TABS, SupervisorTabId } from '@/constants/supervisor';

type Tab = SupervisorTabId;

const Supervisor = () => {
  const navigate = useNavigate();
  const { logout } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs = SUPERVISOR_TABS;

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      {/* Premium Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-background to-purple-500/5" />

        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-3xl animate-float opacity-60" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-3xl animate-float opacity-50" style={{ animationDelay: '-3s' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
      </div>

      {/* Premium Header */}
      {/* Premium Header */}
      <SupervisorHeader activeTab={activeTab} />

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
                  className={`relative flex items-center gap-2.5 px-5 py-3.5 whitespace-nowrap transition-all duration-300 rounded-xl ${isActive
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
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'team' && <TeamManager />}
        {activeTab === 'routines' && <RoutineEditor />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
};

export default Supervisor;