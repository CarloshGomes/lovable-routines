import { StatCard } from '@/components/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
    TrendingUp, CheckCircle2, FileText, Users as UsersIcon
} from 'lucide-react';

interface StatsOverviewProps {
    isLoading?: boolean;
    completionRate: number;
    completedTasks: number;
    totalTasks: number;
    totalReports: number;
    totalUsers: number;
    onOpenCompletionModal: () => void;
    onOpenTasksModal: () => void;
    onOpenReportsModal: () => void;
    onOpenOperatorsModal: () => void;
}

export const StatsOverview = ({
    isLoading,
    completionRate,
    completedTasks,
    totalTasks,
    totalReports,
    totalUsers,
    onOpenCompletionModal,
    onOpenTasksModal,
    onOpenReportsModal,
    onOpenOperatorsModal
}: StatsOverviewProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-card border border-border space-y-4">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Taxa de Conclusão"
                value={`${completionRate}%`}
                icon={TrendingUp}
                trend={5}
                color="text-primary"
                onClick={onOpenCompletionModal}
            />
            <StatCard
                title="Tarefas Concluídas"
                value={`${completedTasks}/${totalTasks}`}
                icon={CheckCircle2}
                color="text-success"
                onClick={onOpenTasksModal}
            />
            <StatCard
                title="Relatórios Enviados"
                value={totalReports}
                icon={FileText}
                color="text-accent"
                onClick={onOpenReportsModal}
            />
            <StatCard
                title="Operadores Ativos"
                value={totalUsers}
                icon={UsersIcon}
                color="text-warning"
                onClick={onOpenOperatorsModal}
            />
        </div>
    );
};
