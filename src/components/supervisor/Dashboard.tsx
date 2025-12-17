import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { StatCard } from '@/components/StatCard';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/Button';
import { 
  TrendingUp, CheckCircle2, FileText, Users as UsersIcon,
  Clock, AlertTriangle, User, Users, Calendar, List, Bell
} from 'lucide-react';
import CalendarView from './CalendarView';
import { CompletionRateModal } from './modals/CompletionRateModal';
import { TasksCompletedModal } from './modals/TasksCompletedModal';
import { ReportsModal } from './modals/ReportsModal';
import { ActiveOperatorsModal } from './modals/ActiveOperatorsModal';
import { toast } from 'sonner';

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
  const [operatorFilterOpen, setOperatorFilterOpen] = useState(false);
  const [operatorSearch, setOperatorSearch] = useState('');

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

  // Automatic notifications for late tasks
  useEffect(() => {
    if (!notificationsEnabled) return;

    lateOperatorsData.forEach(({ username, lateBlocks }) => {
      lateBlocks.forEach((block) => {
        const notificationKey = `${today}-${username}-${block.id}`;
        
        if (!notifiedRef.current.has(notificationKey)) {
          notifiedRef.current.add(notificationKey);
          
          const operatorName = userProfiles[username]?.name || username;
          
          toast.error(
            `Tarefa Atrasada: ${operatorName}`,
            {
              description: `${block.label} não foi concluído no horário previsto`,
              duration: 8000,
              icon: <AlertTriangle className="w-5 h-5 text-danger" />,
            }
          );
        }
      });
    });
  }, [lateOperatorsData, notificationsEnabled, today, userProfiles]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Painel de Controle</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setNotificationsEnabled(!notificationsEnabled);
              toast.info(notificationsEnabled ? 'Notificações desativadas' : 'Notificações ativadas');
            }}
            variant={notificationsEnabled ? 'primary' : 'outline'}
            className="flex items-center gap-2"
            title={notificationsEnabled ? 'Desativar notificações' : 'Ativar notificações'}
          >
            <Bell className={`w-4 h-4 ${notificationsEnabled ? '' : 'opacity-50'}`} />
          </Button>
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

      {/* Operator multi-filter (improved UI) */}
      <div className="relative">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Filtrar Operadores:</label>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-2 max-w-2xl">
              {selectedOperators.length === 0 ? (
                <span className="text-sm text-muted-foreground">Todos</span>
              ) : (
                selectedOperators.map((u) => (
                  <button
                    key={u}
                    onClick={() => setSelectedOperators((s) => s.filter(x => x !== u))}
                    className="px-2 py-1 rounded-full bg-muted/60 text-sm flex items-center gap-2"
                  >
                    <span>{userProfiles[u]?.name || u}</span>
                    <span className="text-xs text-muted-foreground">✕</span>
                  </button>
                ))
              )}
            </div>
            <Button size="sm" variant="outline" onClick={() => setOperatorFilterOpen((v) => !v)}>
              Filtrar
            </Button>
            {selectedOperators.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setSelectedOperators([])}>
                Limpar
              </Button>
            )}
          </div>
        </div>

        {operatorFilterOpen && (
          <div className="absolute z-40 mt-2 w-80 bg-card border border-border rounded shadow-lg p-3">
            <input
              placeholder="Buscar operador..."
              value={operatorSearch}
              onChange={(e) => setOperatorSearch(e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm"
            />
            <div className="max-h-48 overflow-y-auto mt-2 space-y-1">
              {Object.entries(userProfiles)
                .filter(([u, p]) => p.name.toLowerCase().includes(operatorSearch.toLowerCase()) || u.toLowerCase().includes(operatorSearch.toLowerCase()))
                .map(([u, p]) => (
                  <label key={u} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedOperators.includes(u)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedOperators((s) => Array.from(new Set([...s, u])));
                        else setSelectedOperators((s) => s.filter(x => x !== u));
                      }}
                      className="w-4 h-4"
                    />
                    <div className="flex-1 text-sm">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.role}</div>
                    </div>
                  </label>
                ))}
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => { setSelectedOperators([]); setOperatorSearch(''); }}>
                Limpar
              </Button>
              <Button size="sm" onClick={() => setOperatorFilterOpen(false)}>Fechar</Button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Taxa de Conclusão"
          value={`${completionRate}%`}
          icon={TrendingUp}
          trend={5}
          color="text-primary"
          onClick={() => setCompletionModalOpen(true)}
        />
        <StatCard
          title="Tarefas Concluídas"
          value={`${completedTasks}/${totalTasks}`}
          icon={CheckCircle2}
          color="text-success"
          onClick={() => setTasksModalOpen(true)}
        />
        <StatCard
          title="Relatórios Enviados"
          value={totalReports}
          icon={FileText}
          color="text-accent"
          onClick={() => setReportsModalOpen(true)}
        />
        <StatCard
          title="Operadores Ativos"
          value={totalUsers}
          icon={UsersIcon}
          color="text-warning"
          onClick={() => setOperatorsModalOpen(true)}
        />
      </div>

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
        <>
          {/* Controle Detalhado por Operador */}
          <div className="space-y-6">
          {Object.entries(userProfiles)
            .filter(([username]) => selectedOperators.length === 0 || selectedOperators.includes(username))
            .map(([username, profile]) => {
          const isActive = activeUsers.has(username);
          const schedule = schedules[username] || [];
          const tracking = todayTrackingData[username] || {};
          const currentHour = new Date().getHours();
          
          return (
            <GlassCard key={username}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${profile.color}-500/20 text-2xl`}>
                  {profile.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{profile.name}</h3>
                    {isActive ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        Online
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        Offline
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{profile.role}</p>
                </div>
              </div>

              <div className="space-y-3">
                {schedule.map((block) => {
                  const blockTracking = tracking[block.id];
                  const isCompleted = blockTracking && blockTracking.tasks.length === block.tasks.length;
                  const isPast = block.time < currentHour;
                  const isCurrent = block.time === currentHour;
                  const isLate = isPast && !isCompleted && block.tasks.length > 0;
                  
                  let statusColor = 'bg-muted';
                  let statusText = 'Aguardando';
                  let statusIcon = '⏳';
                  
                  if (isCompleted) {
                    statusColor = 'bg-success/20 border-success/50';
                    statusText = 'Concluído';
                    statusIcon = '✓';
                  } else if (isLate) {
                    statusColor = 'bg-danger/20 border-danger/50';
                    statusText = 'Atrasado';
                    statusIcon = '⚠️';
                  } else if (isCurrent) {
                    statusColor = 'bg-primary/20 border-primary/50';
                    statusText = 'Em Andamento';
                    statusIcon = '▶️';
                  }

                  return (
                    <div key={block.id} className={`p-4 rounded-xl border ${statusColor}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{statusIcon}</span>
                          <span className="font-bold">{block.label}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            block.priority === 'high' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                          }`}>
                            {block.priority === 'high' ? 'Alta' : 'Média'}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{statusText}</span>
                      </div>

                      {block.tasks.length > 0 && (
                        <div className="space-y-1 mt-3">
                          {block.tasks.map((task, idx) => {
                            const isTaskCompleted = blockTracking?.tasks.includes(idx);
                            return (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                  isTaskCompleted 
                                    ? 'bg-success border-success text-white' 
                                    : 'border-muted-foreground'
                                }`}>
                                  {isTaskCompleted && <CheckCircle2 className="w-3 h-3" />}
                                </div>
                                <span className={isTaskCompleted ? 'line-through text-muted-foreground' : ''}>
                                  {task}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {blockTracking?.report && (
                        <div className="mt-3 p-2 rounded-lg bg-background/50 border border-border">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-3 h-3 text-primary" />
                            <span className="text-xs font-medium">Relatório:</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{blockTracking.report}</p>
                          {blockTracking.reportSent && (
                            <div className="mt-1 text-xs text-success flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Enviado
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          );
        })}
          </div>

          {/* Activity Log */}
      <GlassCard>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Atividades Recentes
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activityLog.slice(0, 20).map((log) => (
            <div key={log.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium">{log.user}</span> {log.message}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
          {activityLog.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma atividade registrada ainda
            </div>
          )}
        </div>
          </GlassCard>
        </>
      )}
    </div>
  );
};

export default Dashboard;
