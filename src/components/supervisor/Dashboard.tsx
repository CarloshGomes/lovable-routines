import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { AlertTriangle, Calendar, List } from 'lucide-react';
import { toast } from 'sonner';
import { SpotlightCard } from '@/components/SpotlightCard';

// Components
import { StatsOverview } from './dashboard/StatsOverview';
import { OperatorGrid } from './dashboard/OperatorGrid';
import { OperatorFilter } from './dashboard/components/OperatorFilter';
import { NotificationCenter } from './NotificationCenter';
import CalendarView from './CalendarView';

// Modals
import { CompletionRateModal } from './modals/CompletionRateModal';
import { TasksCompletedModal } from './modals/TasksCompletedModal';
import { ReportsModal } from './modals/ReportsModal';
import { JustificationsModal } from './modals/JustificationsModal';
import { ActiveOperatorsModal } from './modals/ActiveOperatorsModal';

// Hooks
import { useDashboardStats } from './dashboard/hooks/useDashboardStats';
import { useDashboardModals } from './dashboard/hooks/useDashboardModals';
import { useDashboardNotifications } from './dashboard/hooks/useDashboardNotifications';

const Dashboard = () => {
  // 1. Stats and Data Logic
  const {
    todayTrackingData,
    totalTasks,
    completedTasks,
    totalReports,
    completionRate,
    totalUsers,
    lateOperatorsData,
    lateOperators,
    userProfiles,
    schedules,
    trackingData,
    activeUsers
  } = useDashboardStats();

  // 2. Modals Logic
  const modals = useDashboardModals();

  // 3. Notifications Logic
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    notificationsEnabled,
    setNotificationsEnabled
  } = useDashboardNotifications({ lateOperatorsData });

  // 4. UI State
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading for smooth transition
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Painel de Controle</h2>
        <div className="flex gap-2">
          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAll}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={() => {
              setNotificationsEnabled(!notificationsEnabled);
              toast.info(notificationsEnabled ? 'Notificações popup desativadas' : 'Notificações popup ativadas');
            }}
          />
          <Button
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            Lista
          </Button>
          <Button
            onClick={() => setViewMode('calendar')}
            variant={viewMode === 'calendar' ? 'primary' : 'outline'}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Calendário
          </Button>
        </div>
      </div>

      {/* Operator Filter */}
      <OperatorFilter
        userProfiles={userProfiles}
        selectedOperators={selectedOperators}
        setSelectedOperators={setSelectedOperators}
      />

      {/* Stats Overview */}
      <StatsOverview
        isLoading={isLoading}
        completionRate={completionRate}
        completedTasks={completedTasks}
        totalTasks={totalTasks}
        totalReports={totalReports}
        totalUsers={totalUsers}
        onOpenCompletionModal={() => modals.setCompletionModalOpen(true)}
        onOpenTasksModal={() => modals.setTasksModalOpen(true)}
        onOpenReportsModal={() => modals.setReportsModalOpen(true)}
        onOpenOperatorsModal={() => modals.setOperatorsModalOpen(true)}
        onOpenJustificationsModal={() => modals.setJustificationsModalOpen(true)}
      />

      {/* Modals */}
      <CompletionRateModal open={modals.completionModalOpen} onOpenChange={modals.setCompletionModalOpen} />
      <TasksCompletedModal open={modals.tasksModalOpen} onOpenChange={modals.setTasksModalOpen} />
      <ReportsModal open={modals.reportsModalOpen} onOpenChange={modals.setReportsModalOpen} />
      <ActiveOperatorsModal open={modals.operatorsModalOpen} onOpenChange={modals.setOperatorsModalOpen} />
      <JustificationsModal open={modals.justificationsModalOpen} onOpenChange={modals.setJustificationsModalOpen} />

      {/* Late Alert */}
      {lateOperators.length > 0 && (
        <SpotlightCard className="bg-danger/10 border-danger animate-pulseRed" spotlightColor="rgba(239, 68, 68, 0.2)">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-danger flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-danger mb-2">Operadores com Tarefas Atrasadas</h3>
              <div className="space-y-1">
                {lateOperators.map(([username]) => (
                  <div key={username} className="text-sm text-danger/80">
                    {userProfiles[username]?.name || username} - {userProfiles[username]?.role || 'Operador'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* View Content */}
      {viewMode === 'calendar' ? (
        <CalendarView />
      ) : (
        <OperatorGrid
          isLoading={isLoading}
          userProfiles={userProfiles}
          schedules={schedules}
          trackingData={trackingData}
          activeUsers={activeUsers}
          selectedOperators={selectedOperators}
        />
      )}
    </div>
  );
};

export default Dashboard;

