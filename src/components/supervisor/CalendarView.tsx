import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/Button';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  CheckCircle2, AlertTriangle, Clock, FileText
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarViewProps {}

const CalendarView = ({}: CalendarViewProps) => {
  const { userProfiles, schedules, trackingData, activeUsers } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Get calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get all scheduled blocks for a specific date with tracking status
  const getActivitiesForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const activities: Array<{
      username: string;
      profile: any;
      blockId: string;
      block: any;
      tracking: any | null;
      isActive: boolean;
    }> = [];

    // For each operator, get their complete schedule
    Object.entries(userProfiles).forEach(([username, profile]) => {
      const schedule = schedules[username] || [];
      const userTracking = trackingData[username] || {};
      
      schedule.forEach((block) => {
        // Check if there's tracking data for this block on this date
        const trackingKey = `${dateKey}-${block.id}`;
        const tracking = userTracking[trackingKey] || null;
        
        activities.push({
          username,
          profile,
          blockId: block.id,
          block,
          tracking,
          isActive: activeUsers.has(username),
        });
      });
    });

    return activities.sort((a, b) => {
      // Sort by time
      return a.block.time - b.block.time;
    });
  };

  // Get activity summary for a date (for calendar cells)
  const getDateSummary = (date: Date) => {
    const activities = getActivitiesForDate(date);
    const totalTasks = activities.reduce((sum, act) => {
      return sum + (act.block?.tasks.length || 0);
    }, 0);
    const completedTasks = activities.reduce((sum, act) => {
      return sum + (act.tracking?.tasks.length || 0);
    }, 0);
    const hasLate = activities.some(act => {
      const isCompleted = act.tracking && act.tracking.tasks.length === act.block?.tasks.length;
      return !isCompleted && act.block?.tasks.length > 0;
    });

    return { activities: activities.length, totalTasks, completedTasks, hasLate };
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={goToToday} variant="outline">
              Hoje
            </Button>
            <Button onClick={goToPreviousMonth} variant="ghost" className="p-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button onClick={goToNextMonth} variant="ghost" className="p-2">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, idx) => {
            const summary = getDateSummary(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`
                  min-h-24 p-2 rounded-lg border-2 transition-all
                  ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                  ${isToday ? 'border-primary' : 'border-border'}
                  ${isSelected ? 'ring-2 ring-primary bg-primary/10' : ''}
                  ${summary.activities > 0 ? 'cursor-pointer hover:border-primary/50' : 'cursor-default'}
                `}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, 'd')}
                </div>
                
                {summary.activities > 0 && (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-center gap-1 text-primary">
                      <Clock className="w-3 h-3" />
                      <span>{summary.activities}</span>
                    </div>
                    
                    {summary.totalTasks > 0 && (
                      <div className={`flex items-center justify-center gap-1 ${
                        summary.hasLate ? 'text-danger' : 
                        summary.completedTasks === summary.totalTasks ? 'text-success' : 'text-warning'
                      }`}>
                        {summary.hasLate ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : summary.completedTasks === summary.totalTasks ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{summary.completedTasks}/{summary.totalTasks}</span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Selected Date Details */}
      {selectedDate && (
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold">
              {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
          </div>

          {(() => {
            const activities = getActivitiesForDate(selectedDate);
            
            if (activities.length === 0) {
              return (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhuma atividade registrada neste dia
                </div>
              );
            }

            // Group by user
            const byUser = activities.reduce((acc, act) => {
              if (!acc[act.username]) acc[act.username] = [];
              acc[act.username].push(act);
              return acc;
            }, {} as Record<string, typeof activities>);

            return (
              <div className="space-y-6">
                {Object.entries(byUser).map(([username, userActivities]) => {
                  const profile = userProfiles[username];
                  const isActive = activeUsers.has(username);
                  
                  // Calculate completion stats for this user
                  const totalTasks = userActivities.reduce((sum, act) => sum + act.block.tasks.length, 0);
                  const completedTasks = userActivities.reduce((sum, act) => sum + (act.tracking?.tasks.length || 0), 0);
                  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                  return (
                    <div key={username} className="border-l-4 border-primary/50 pl-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${profile.color}-500/20 text-xl`}>
                          {profile.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold">{profile.name}</h4>
                            {isActive && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                Online
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{profile.role}</span>
                            <span>•</span>
                            <span className={`font-medium ${
                              completionRate === 100 ? 'text-success' : 
                              completionRate >= 50 ? 'text-warning' : 'text-danger'
                            }`}>
                              {completedTasks}/{totalTasks} tarefas ({completionRate}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {userActivities.map((activity) => {
                          const block = activity.block;
                          const tracking = activity.tracking;
                          const isCompleted = tracking && tracking.tasks.length === block.tasks.length;
                          const hasPartial = tracking && tracking.tasks.length > 0 && tracking.tasks.length < block.tasks.length;
                          const notStarted = !tracking || tracking.tasks.length === 0;

                          let statusColor = 'bg-muted/30 border-border';
                          let statusText = 'Não iniciado';
                          let statusIcon = '⏳';

                          if (isCompleted) {
                            statusColor = 'bg-success/10 border-success/50';
                            statusText = 'Concluído';
                            statusIcon = '✓';
                          } else if (hasPartial) {
                            statusColor = 'bg-warning/10 border-warning/50';
                            statusText = 'Em andamento';
                            statusIcon = '▶️';
                          }

                          return (
                            <div key={activity.blockId} className={`p-4 rounded-lg border ${statusColor}`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{statusIcon}</span>
                                  <span className="font-medium">{block.label}</span>
                                  {block.priority && (
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      block.priority === 'high' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                                    }`}>
                                      {block.priority === 'high' ? 'Alta' : 'Média'}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">{statusText}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {block.time}:00
                                  </span>
                                </div>
                              </div>

                              {/* Tasks */}
                              {block.tasks && block.tasks.length > 0 && (
                                <div className="space-y-2 mb-3">
                                  {block.tasks.map((task: string, idx: number) => {
                                    const isTaskCompleted = tracking?.tasks.includes(idx);
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

                              {/* Report */}
                              {tracking?.report && (
                                <div className="mt-3 p-3 rounded-lg bg-background/50 border border-border">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium">Relatório:</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {tracking.report}
                                  </p>
                                  {tracking.reportSent && (
                                    <div className="mt-2 text-xs text-success flex items-center gap-1">
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
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </GlassCard>
      )}
    </div>
  );
};

export default CalendarView;
