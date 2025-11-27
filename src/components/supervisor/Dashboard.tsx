import { useApp } from '@/contexts/AppContext';
import { StatCard } from '@/components/StatCard';
import { GlassCard } from '@/components/GlassCard';
import { 
  TrendingUp, CheckCircle2, FileText, Users as UsersIcon,
  Clock, AlertTriangle, User, Users
} from 'lucide-react';

const Dashboard = () => {
  const { userProfiles, schedules, trackingData, activityLog, activeUsers } = useApp();

  const totalUsers = Object.keys(userProfiles).length;
  
  let totalTasks = 0;
  let completedTasks = 0;
  let totalReports = 0;

  Object.keys(schedules).forEach((username) => {
    const schedule = schedules[username];
    const tracking = trackingData[username] || {};
    
    schedule.forEach((block) => {
      totalTasks += block.tasks.length;
      const blockTracking = tracking[block.time];
      if (blockTracking) {
        completedTasks += blockTracking.tasks.length;
        if (blockTracking.reportSent) totalReports++;
      }
    });
  });

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const currentHour = new Date().getHours();
  const lateOperators = Object.entries(schedules).filter(([username, schedule]) => {
    const tracking = trackingData[username] || {};
    return schedule.some((block) => {
      if (block.time < currentHour) {
        const blockTracking = tracking[block.time];
        return !blockTracking || blockTracking.tasks.length < block.tasks.length;
      }
      return false;
    });
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Taxa de Conclusão"
          value={`${completionRate}%`}
          icon={TrendingUp}
          trend={5}
          color="text-primary"
        />
        <StatCard
          title="Tarefas Concluídas"
          value={`${completedTasks}/${totalTasks}`}
          icon={CheckCircle2}
          color="text-success"
        />
        <StatCard
          title="Relatórios Enviados"
          value={totalReports}
          icon={FileText}
          color="text-accent"
        />
        <StatCard
          title="Operadores Ativos"
          value={totalUsers}
          icon={UsersIcon}
          color="text-warning"
        />
      </div>

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

      {/* Controle Detalhado por Operador */}
      <div className="space-y-6">
        {Object.entries(userProfiles)
          .filter(([username]) => activeUsers.has(username))
          .map(([username, profile]) => {
          const schedule = schedules[username] || [];
          const tracking = trackingData[username] || {};
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
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      Online
                    </span>
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
        {Object.keys(userProfiles).filter((u) => activeUsers.has(u)).length === 0 && (
          <GlassCard>
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum operador ativo no momento</p>
            </div>
          </GlassCard>
        )}
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
    </div>
  );
};

export default Dashboard;
