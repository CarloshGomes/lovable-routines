import { useApp } from '@/contexts/AppContext';
import { StatCard } from '@/components/StatCard';
import { GlassCard } from '@/components/GlassCard';
import { 
  TrendingUp, CheckCircle2, FileText, Users as UsersIcon,
  Clock, AlertTriangle, User
} from 'lucide-react';

const Dashboard = () => {
  const { userProfiles, schedules, trackingData, activityLog } = useApp();

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operators Status */}
        <GlassCard>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            Status dos Operadores
          </h3>
          <div className="space-y-3">
            {Object.entries(userProfiles).map(([username, profile]) => {
              const schedule = schedules[username] || [];
              const tracking = trackingData[username] || {};
              
              const userTotalTasks = schedule.reduce((sum, block) => sum + block.tasks.length, 0);
              const userCompletedTasks = Object.values(tracking).reduce((sum, t) => sum + t.tasks.length, 0);
              const userProgress = userTotalTasks > 0 ? (userCompletedTasks / userTotalTasks) * 100 : 0;

              return (
                <div key={username} className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${profile.color}-500/20`}>
                      {profile.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{profile.name}</div>
                      <div className="text-xs text-muted-foreground">{profile.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{Math.round(userProgress)}%</div>
                      <div className="text-xs text-muted-foreground">{userCompletedTasks}/{userTotalTasks}</div>
                    </div>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-primary transition-all duration-500"
                      style={{ width: `${userProgress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

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
    </div>
  );
};

export default Dashboard;
