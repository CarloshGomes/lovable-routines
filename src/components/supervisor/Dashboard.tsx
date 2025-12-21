import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/Button';
import {
  AlertTriangle, Calendar, List, Bell, Check, ChevronsUpDown, BellOff
} from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import CalendarView from './CalendarView';
import { CompletionRateModal } from './modals/CompletionRateModal';
import { TasksCompletedModal } from './modals/TasksCompletedModal';
import { ReportsModal } from './modals/ReportsModal';
import { ActiveOperatorsModal } from './modals/ActiveOperatorsModal';
import { toast } from 'sonner';
import { GlassCard } from '@/components/GlassCard';

// Extracted Components
import { StatsOverview } from './dashboard/StatsOverview';
import { OperatorGrid } from './dashboard/OperatorGrid';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationCenter } from './NotificationCenter';

interface LateNotification {
  username: string;
  operatorName: string;
  blockLabel: string;
  notifiedAt: number;
}

const Dashboard = () => {
  const { userProfiles, schedules, trackingData, activityLog, activeUsers } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [operatorsModalOpen, setOperatorsModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const notifiedRef = useRef<Set<string>>(new Set());
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);

  // Simulated Loading State
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data fetch
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Filter tracking data to show only today's data in list view
  const today = new Date().toISOString().split('T')[0];
  const todayTrackingData: Record<string, Record<string, any>> = {};
  Object.entries(trackingData).forEach(([username, userTracking]) => {
    todayTrackingData[username] = {};
    Object.entries(userTracking).forEach(([key, value]) => {
      if (key.startsWith(today)) {
        const blockId = key.substring(11); // Remove "YYYY-MM-DD-" prefix
        todayTrackingData[username][blockId] = value;
      }
    });
  });

  const totalUsers = Object.keys(userProfiles).length;

  let totalTasks = 0;
  let completedTasks = 0;
  let totalReports = 0;

  Object.keys(schedules).forEach((username) => {
    const schedule = schedules[username];
    const tracking = todayTrackingData[username] || {};

    schedule.forEach((block) => {
      totalTasks += block.tasks.length;
      const blockTracking = tracking[block.id];
      if (blockTracking) {
        completedTasks += blockTracking.tasks.length;
        if (blockTracking.reportSent) totalReports++;
      }
    });
  });

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const currentHour = new Date().getHours();

  // Detect late operators and their specific late blocks
  const lateOperatorsData: { username: string; lateBlocks: typeof schedules[string] }[] = [];

  Object.entries(schedules).forEach(([username, schedule]) => {
    const tracking = todayTrackingData[username] || {};
    const lateBlocks = schedule.filter((block) => {
      if (block.time < currentHour) {
        const blockTracking = tracking[block.id];
        return !blockTracking || blockTracking.tasks.length < block.tasks.length;
      }
      return false;
    });

    if (lateBlocks.length > 0) {
      lateOperatorsData.push({ username, lateBlocks });
    }
  });

  const lateOperators = lateOperatorsData.map(d => [d.username, schedules[d.username]] as [string, typeof schedules[string]]);

  // Notifications Hook
  const { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll } = useNotifications();

  // Automatic notifications for late tasks
  useEffect(() => {
    // Always check for late tasks
    lateOperatorsData.forEach(({ username, lateBlocks }) => {
      lateBlocks.forEach((block) => {
        const notificationKey = `${today}-${username}-${block.id}`;

        if (!notifiedRef.current.has(notificationKey)) {
          notifiedRef.current.add(notificationKey);

          const operatorName = userProfiles[username]?.name || username;

          // Add to persistent store
          addNotification(
            `Tarefa Atrasada: ${operatorName}`,
            `${block.label} não foi concluído no horário previsto`,
            'warning'
          );

          // Show toast if enabled
          if (notificationsEnabled) {
            toast.error(
              `Tarefa Atrasada: ${operatorName}`,
              {
                description: `${block.label} não foi concluído no horário previsto`,
                duration: 8000,
                icon: <AlertTriangle className="w-5 h-5 text-danger" />,
              }
            );
          }
        }
      });
    });
  }, [lateOperatorsData, notificationsEnabled, today, userProfiles, addNotification]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Mode Toggle */}
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


      {/* Operator Filter (Popover + Command) */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Filtrar Operadores:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="justify-between min-w-[200px]">
              {selectedOperators.length === 0
                ? "Todos os operadores"
                : `${selectedOperators.length} selecionado(s)`}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar operador..." />
              <CommandList>
                <CommandEmpty>Nenhum operador encontrado.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setSelectedOperators([])}
                    className="cursor-pointer"
                  >
                    <div className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedOperators.length === 0 ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                    )}>
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    <span>Todos</span>
                  </CommandItem>
                  {Object.entries(userProfiles).map(([username, profile]) => {
                    const isSelected = selectedOperators.includes(username);
                    return (
                      <CommandItem
                        key={username}
                        onSelect={() => {
                          if (isSelected) {
                            setSelectedOperators(prev => prev.filter(u => u !== username));
                          } else {
                            setSelectedOperators(prev => [...prev, username]);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <div className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                        )}>
                          <Check className={cn("h-4 w-4")} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{profile.name}</span>
                          <span className="text-xs text-muted-foreground">({profile.role})</span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedOperators.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedOperators([])}
            className="text-muted-foreground hover:text-foreground"
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Stats Overview Component */}
      <StatsOverview
        isLoading={isLoading}
        completionRate={completionRate}
        completedTasks={completedTasks}
        totalTasks={totalTasks}
        totalReports={totalReports}
        totalUsers={totalUsers}
        onOpenCompletionModal={() => setCompletionModalOpen(true)}
        onOpenTasksModal={() => setTasksModalOpen(true)}
        onOpenReportsModal={() => setReportsModalOpen(true)}
        onOpenOperatorsModal={() => setOperatorsModalOpen(true)}
      />

      {/* Modals */}
      <CompletionRateModal open={completionModalOpen} onOpenChange={setCompletionModalOpen} />
      <TasksCompletedModal open={tasksModalOpen} onOpenChange={setTasksModalOpen} />
      <ReportsModal open={reportsModalOpen} onOpenChange={setReportsModalOpen} />
      <ActiveOperatorsModal open={operatorsModalOpen} onOpenChange={setOperatorsModalOpen} />

      {/* Late Alert */}
      {lateOperators.length > 0 && (
        <GlassCard className="bg-danger/10 border-danger animate-pulseRed">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-danger flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-danger mb-2">Operadores com Tarefas Atrasadas</h3>
              <div className="space-y-1">
                {lateOperators.map(([username]) => (
                  <div key={username} className="text-sm">
                    {userProfiles[username].name} - {userProfiles[username].role}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Content based on view mode */}
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
