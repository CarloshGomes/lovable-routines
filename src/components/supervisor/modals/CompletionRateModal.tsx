import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, User } from 'lucide-react';

interface CompletionRateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CompletionRateModal = ({ open, onOpenChange }: CompletionRateModalProps) => {
  const { userProfiles, schedules, trackingData } = useApp();
  const today = new Date().toISOString().split('T')[0];

  const operatorStats = Object.entries(userProfiles).map(([username, profile]) => {
    const schedule = schedules[username] || [];
    let totalTasks = 0;
    let completedTasks = 0;

    schedule.forEach((block) => {
      totalTasks += block.tasks.length;
      const tracking = trackingData[username]?.[`${today}-${block.id}`];
      if (tracking) {
        completedTasks += tracking.tasks.length;
      }
    });

    const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      username,
      profile,
      totalTasks,
      completedTasks,
      rate,
    };
  });

  const overallCompleted = operatorStats.reduce((acc, op) => acc + op.completedTasks, 0);
  const overallTotal = operatorStats.reduce((acc, op) => acc + op.totalTasks, 0);
  const overallRate = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-5 h-5 text-primary" />
            Taxa de Conclusão - Detalhes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Taxa Geral do Dia</span>
              <span className="text-2xl font-bold text-primary">{overallRate}%</span>
            </div>
            <Progress value={overallRate} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {overallCompleted} de {overallTotal} tarefas concluídas
            </p>
          </div>

          {/* Per Operator */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Por Operador</h4>
            {operatorStats.map(({ username, profile, totalTasks, completedTasks, rate }) => (
              <div key={username} className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${profile.color}-500/20 text-xl`}>
                    {profile.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{profile.name}</div>
                    <div className="text-xs text-muted-foreground">{profile.role}</div>
                  </div>
                  <div className={`text-xl font-bold ${rate >= 80 ? 'text-success' : rate >= 50 ? 'text-warning' : 'text-danger'}`}>
                    {rate}%
                  </div>
                </div>
                <Progress value={rate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {completedTasks} de {totalTasks} tarefas
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
