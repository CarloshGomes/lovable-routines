import { GlassCard } from '@/components/GlassCard';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, FileText, Users as UsersIcon } from 'lucide-react';
import { RoutineCard, RoutineBlock, Task } from '@/components/operator/RoutineCard';



import { UserProfile } from '@/types/auth';
import { ScheduleBlock } from '@/types/operations';


interface OperatorGridProps {
    isLoading?: boolean;
    userProfiles: Record<string, UserProfile>;
    schedules: Record<string, ScheduleBlock[]>;
    trackingData: Record<string, Record<string, any>>; // Keeping nested any for now or define stricter if possible
    activeUsers: Set<string>;
    selectedOperators: string[];
}

export const OperatorGrid = ({
    isLoading,
    userProfiles,
    schedules,
    trackingData,
    activeUsers,
    selectedOperators
}: OperatorGridProps) => {
    const currentHour = new Date().getHours();
    // We need to re-calculate today's tracking data inside here or pass it as prop?
    // Passing 'trackingData' passed as prop should probably be the full object, 
    // but let's re-use the logic or expect processed data?
    // For simplicity, let's assume the parent passes 'todayTrackingData' or we re-process here.
    // The 'trackingData' prop in AppContext is generic. 
    // Let's re-implement the 'today' filtering logic here lightly or pass it down.
    // Actually, filtering creates derived state. It's better if the parent passes the filtered 'todayTrackingData',
    // but the current Dashboard structure has that logic inline.
    // Let's implement the day filtering here to be safe and self-contained, or ask parent to pass it.
    // The implementation plan said "trackingData" as prop. Let's assume passed prop is the FULL data and we filter inside,
    // OR we strictly follow the extraction.

    // PROPER EXTRACTION:
    const today = new Date().toISOString().split('T')[0];
    const todayTrackingData: Record<string, Record<string, any>> = {};

    if (!isLoading) {
        Object.entries(trackingData).forEach(([username, userTracking]) => {
            todayTrackingData[username] = {};
            Object.entries(userTracking).forEach(([key, value]) => {
                if (key.startsWith(today)) {
                    const blockId = key.substring(11);
                    todayTrackingData[username][blockId] = value;
                }
            });
        });
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[...Array(3)].map((_, j) => (
                                <Skeleton key={j} className="h-24 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const filteredOperators = Object.entries(userProfiles).filter(([username]) =>
        selectedOperators.length === 0 || selectedOperators.includes(username)
    );

    if (filteredOperators.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <UsersIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhum operador encontrado</h3>
                <p className="text-muted-foreground max-w-sm">
                    Não encontramos operadores com os filtros atuais. Tente limpar a busca ou selecionar outros filtros.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredOperators.map(([username, profile]) => {
                const isActive = activeUsers.has(username);
                const schedule = schedules[username] || [];
                const tracking = todayTrackingData[username] || {};

                return (
                    <GlassCard key={username} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${profile.color}-500/20 text-2xl group-hover:scale-110 transition-transform duration-300`}>
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
                                const hasTasks = block.tasks.length > 0;
                                const isCompleted = hasTasks && blockTracking && blockTracking.tasks.length === block.tasks.length;
                                const isPast = block.time < currentHour;
                                const isCurrent = block.time === currentHour;
                                const isLate = isPast && !isCompleted && hasTasks;

                                let status = 'future';
                                if (isCompleted) status = 'done';
                                else if (isLate) status = 'late';
                                else if (isCurrent) status = 'current';

                                // Map to RoutineBlock structure
                                const routineTasks: Task[] = block.tasks.map((taskLabel: string, index: number) => ({
                                    id: index.toString(),
                                    label: taskLabel,
                                    completed: blockTracking?.tasks.includes(index) || false
                                }));

                                const routineBlock: RoutineBlock = {
                                    id: block.id,
                                    time: `${block.time.toString().padStart(2, '0')}:00`,
                                    label: block.label,
                                    priority: block.priority as any,
                                    category: block.category || 'Geral',
                                    tasks: routineTasks,
                                    status: status as any
                                };

                                return (
                                    <div key={block.id} className="mb-4 last:mb-0">
                                        <RoutineCard
                                            block={routineBlock}
                                            onTaskToggle={() => { }} // No-op for read-only
                                            noteValue={blockTracking?.report || ''}
                                            isReportSent={blockTracking?.reportSent || false}
                                            timestamp={blockTracking?.timestamp}
                                            readOnly={true}
                                            isEscalated={blockTracking?.escalated}
                                            delayReason={blockTracking?.delayReason}
                                            isImpossible={blockTracking?.isImpossible}
                                            attachments={blockTracking?.attachments}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                );
            })}
        </div>
    );
};
