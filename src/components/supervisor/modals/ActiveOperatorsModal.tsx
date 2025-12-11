import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { Users, User, Clock, CheckCircle2 } from 'lucide-react';

interface ActiveOperatorsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ActiveOperatorsModal = ({ open, onOpenChange }: ActiveOperatorsModalProps) => {
  const { userProfiles, schedules, trackingData, activeUsers, activityLog } = useApp();
  const today = new Date().toISOString().split('T')[0];

  const operatorDetails = Object.entries(userProfiles).map(([username, profile]) => {
    const isActive = activeUsers.has(username);
    const schedule = schedules[username] || [];
    
    let totalTasks = 0;
    let completedTasks = 0;
    let reportsSent = 0;

    schedule.forEach((block) => {
      totalTasks += block.tasks.length;
      const tracking = trackingData[username]?.[`${today}-${block.id}`];
      if (tracking) {
        completedTasks += tracking.tasks.length;
        if (tracking.reportSent) reportsSent++;
      }
    });

    const lastActivity = activityLog.find(log => log.user === username);

    return {
      username,
      profile,
      isActive,
      totalTasks,
      completedTasks,
      reportsSent,
      totalBlocks: schedule.length,
      lastActivity: lastActivity?.timestamp,
    };
  });

  const activeCount = operatorDetails.filter(op => op.isActive).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-warning" />
            Operadores - Detalhes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total de Operadores</span>
              <span className="text-2xl font-bold text-warning">{operatorDetails.length}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success" />
                {activeCount} online
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                {operatorDetails.length - activeCount} offline
              </span>
            </div>
          </div>

          {/* Operators List */}
          <div className="space-y-3">
            {operatorDetails.map(({ username, profile, isActive, totalTasks, completedTasks, reportsSent, totalBlocks, lastActivity }) => (
              <div key={username} className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${profile.color}-500/20 text-2xl relative`}>
                    {profile.avatar}
                    <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${isActive ? 'bg-success' : 'bg-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{profile.name}</span>
                      {isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                          Online
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          Offline
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{profile.role}</div>
                    {profile.position && (
                      <div className="text-xs text-muted-foreground">{profile.position}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{completedTasks}/{totalTasks}</div>
                    <div className="text-xs text-muted-foreground">Tarefas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-accent">{reportsSent}/{totalBlocks}</div>
                    <div className="text-xs text-muted-foreground">Relatórios</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-success">
                      {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Conclusão</div>
                  </div>
                </div>

                {lastActivity && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Última atividade: {new Date(lastActivity).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
