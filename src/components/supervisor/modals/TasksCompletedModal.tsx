import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { CheckCircle2, Circle, User } from 'lucide-react';

interface TasksCompletedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TasksCompletedModal = ({ open, onOpenChange }: TasksCompletedModalProps) => {
  const { userProfiles, schedules, trackingData } = useApp();
  const today = new Date().toISOString().split('T')[0];

  const operatorTasks = Object.entries(userProfiles).map(([username, profile]) => {
    const schedule = schedules[username] || [];
    const tasks: { blockLabel: string; task: string; completed: boolean }[] = [];

    schedule.forEach((block) => {
      const tracking = trackingData[username]?.[`${today}-${block.id}`];
      block.tasks.forEach((task, idx) => {
        tasks.push({
          blockLabel: block.label,
          task,
          completed: tracking?.tasks.includes(idx) || false,
        });
      });
    });

    return {
      username,
      profile,
      tasks,
      completedCount: tasks.filter(t => t.completed).length,
      totalCount: tasks.length,
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Tarefas Concluídas - Detalhes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {operatorTasks.map(({ username, profile, tasks, completedCount, totalCount }) => (
            <div key={username} className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${profile.color}-500/20 text-xl`}>
                  {profile.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{profile.name}</div>
                  <div className="text-xs text-muted-foreground">{profile.role}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{completedCount}/{totalCount}</div>
                  <div className="text-xs text-muted-foreground">tarefas</div>
                </div>
              </div>

              {tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                          {task.task}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {task.blockLabel}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma tarefa programada
                </p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
