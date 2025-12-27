import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { StatCard } from '@/components/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
    TrendingUp, CheckCircle2, FileText, Users as UsersIcon, AlertTriangle
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
    onOpenOperatorsModal,
    onOpenJustificationsModal
}: StatsOverviewProps & { onOpenJustificationsModal: () => void }) => {
    // Calculate unread reports and justifications
    const [unreadReports, setUnreadReports] = useState(0);
    const [unreadJustifications, setUnreadJustifications] = useState(0);
    const [totalJustifications, setTotalJustifications] = useState(0);
    const { trackingData } = useApp();

    useEffect(() => {
        const checkUnread = () => {
            try {
                const reviewedReports = new Set(JSON.parse(localStorage.getItem('reviewed_reports') || '[]'));
                const reviewedJustifications = new Set(JSON.parse(localStorage.getItem('reviewed_justifications') || '[]'));
                const today = new Date().toISOString().split('T')[0];
                let unreadR = 0;
                let unreadJ = 0;
                let totalJ = 0;

                Object.entries(trackingData).forEach(([username, userTracking]) => {
                    Object.entries(userTracking).forEach(([key, tracking]: [string, any]) => {
                        // Reports
                        if (key.startsWith(today) && tracking.reportSent) {
                            const blockId = key.substring(11);
                            const reportId = `report-${today}-${username}-${blockId}`;
                            if (!reviewedReports.has(reportId)) {
                                unreadR++;
                            }
                        }
                        // Justifications
                        if (key.startsWith(today) && tracking.delayReason) {
                            totalJ++;
                            const blockId = key.substring(11);
                            const justificationId = `${today}-${username}-${blockId}`;
                            if (!reviewedJustifications.has(justificationId)) {
                                unreadJ++;
                            }
                        }
                    });
                });
                setUnreadReports(unreadR);
                setUnreadJustifications(unreadJ);
                setTotalJustifications(totalJ);
            } catch (e) {
                console.error(e);
            }
        };

        checkUnread();
        const interval = setInterval(checkUnread, 1000);
        return () => clearInterval(interval);
    }, [trackingData]); // Depend on trackingData to update when new reports arrive

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                value={`${totalReports}${unreadReports > 0 ? ` (${unreadReports} novos)` : ''}`}
                icon={FileText}
                color="text-accent"
                onClick={onOpenReportsModal}
            />
            <StatCard
                title="Justificativas"
                value={`${totalJustifications}${unreadJustifications > 0 ? ` (${unreadJustifications} novas)` : ''}`}
                icon={AlertTriangle}
                color="text-warning"
                onClick={onOpenJustificationsModal}
            />
            <StatCard
                title="Operadores Ativos"
                value={totalUsers}
                icon={UsersIcon}
                color="text-info" // Changed to distinguish, or keep warning/primary
                onClick={onOpenOperatorsModal}
            />
        </div>
    );
};
