import { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { GlassCard } from '@/components/GlassCard';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

interface OperatorAnalyticsProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OperatorAnalytics = ({ isOpen, onClose }: OperatorAnalyticsProps) => {
    const { currentUser, schedules, trackingData } = useApp();
    const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');

    const stats = useMemo(() => {
        if (!currentUser) return null;

        const userSchedule = schedules[currentUser] || [];
        const userTracking = trackingData[currentUser] || {};
        const today = new Date();

        let totalScheduledRange = 0;
        let totalCompletedRange = 0;
        let onTimeCount = 0;
        let totalReportsChecked = 0;
        const chartData: any[] = [];

        if (viewMode === 'daily') {
            const dateStr = today.toISOString().split('T')[0];

            // Map schedule to chart data
            const sortedSchedule = [...userSchedule].sort((a, b) => a.time - b.time);

            sortedSchedule.forEach(block => {
                const key = `${dateStr}-${block.id}`;
                const tracking = userTracking[key];

                const blockScheduled = block.tasks.length;
                const blockCompleted = tracking ? tracking.tasks.length : 0;

                totalScheduledRange += blockScheduled;
                totalCompletedRange += blockCompleted;

                // Punctuality Check
                if (tracking && tracking.reportSent && tracking.timestamp) {
                    totalReportsChecked++;
                    const reportTime = new Date(tracking.timestamp);
                    const reportHour = reportTime.getHours();
                    if (reportHour <= block.time + 1) {
                        onTimeCount++;
                    }
                }

                chartData.push({
                    name: `${block.time}h`,
                    date: dateStr,
                    scheduled: blockScheduled,
                    completed: blockCompleted,
                    efficiency: blockScheduled > 0 ? Math.round((blockCompleted / blockScheduled) * 100) : 0
                });
            });

        } else {
            // Weekly Logic
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });

                const dailyScheduled = userSchedule.reduce((acc, block) => acc + block.tasks.length, 0);

                let dailyCompleted = 0;

                userSchedule.forEach(block => {
                    const key = `${dateStr}-${block.id}`;
                    const tracking = userTracking[key];

                    if (tracking) {
                        dailyCompleted += tracking.tasks.length;

                        if (tracking.reportSent && tracking.timestamp) {
                            totalReportsChecked++;
                            const reportTime = new Date(tracking.timestamp);
                            const reportHour = reportTime.getHours();
                            if (reportHour <= block.time + 1) {
                                onTimeCount++;
                            }
                        }
                    }
                });

                totalScheduledRange += dailyScheduled;
                totalCompletedRange += dailyCompleted;

                chartData.push({
                    name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
                    date: dateStr,
                    scheduled: dailyScheduled,
                    completed: dailyCompleted,
                    efficiency: dailyScheduled > 0 ? Math.round((dailyCompleted / dailyScheduled) * 100) : 0
                });
            }
        }

        const averageEfficiency = totalScheduledRange > 0
            ? Math.round((totalCompletedRange / totalScheduledRange) * 100)
            : 0;

        const punctualityRate = totalReportsChecked > 0
            ? Math.round((onTimeCount / totalReportsChecked) * 100)
            : 100;

        return {
            chartData,
            efficiency: averageEfficiency,
            punctuality: punctualityRate,
            totalTasks: totalCompletedRange
        };
    }, [currentUser, schedules, trackingData, viewMode]);

    if (!stats) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between pb-4 border-b border-border/50">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-primary" />
                            Meu Desempenho
                        </DialogTitle>
                        <div className="flex bg-muted/50 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('daily')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'daily'
                                        ? 'bg-background text-primary shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Hoje
                            </button>
                            <button
                                onClick={() => setViewMode('weekly')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'weekly'
                                        ? 'bg-background text-primary shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                7 Dias
                            </button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="p-3 bg-primary/10 rounded-full mb-3">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-3xl font-bold">{stats.efficiency}%</h3>
                        <p className="text-sm text-muted-foreground">Eficácia Geral</p>
                        <span className="text-xs text-primary mt-1">Tarefas realizadas vs agendadas</span>
                    </GlassCard>

                    <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="p-3 bg-blue-500/10 rounded-full mb-3">
                            <Clock className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-3xl font-bold">{stats.punctuality}%</h3>
                        <p className="text-sm text-muted-foreground">Pontualidade</p>
                        <span className="text-xs text-blue-500 mt-1">Entregas no horário previsto</span>
                    </GlassCard>

                    <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="p-3 bg-green-500/10 rounded-full mb-3">
                            <TrendingUp className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-bold">{stats.totalTasks}</h3>
                        <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
                        <span className="text-xs text-green-500 mt-1">
                            {viewMode === 'daily' ? 'Hoje' : 'Últimos 7 dias'}
                        </span>
                    </GlassCard>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {viewMode === 'daily' ? 'Evolução por Horário (Hoje)' : 'Evolução Diária (7 Dias)'}
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '8px',
                                        border: 'none',
                                        color: '#333',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Bar dataKey="completed" name="Concluídas" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={20}>
                                    {stats.chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.efficiency >= 80 ? '#22c55e' : entry.efficiency >= 50 ? '#eab308' : '#ef4444'} />
                                    ))}
                                </Bar>
                                <Bar dataKey="scheduled" name="Meta" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span>Alta Produtividade (&gt;80%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <span>Média (50-80%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span>Atenção (&lt;50%)</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
