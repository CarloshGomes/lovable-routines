import { useMemo } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/Button';
import { Download, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];

export const AnalyticsView = () => {
    const { userProfiles, schedules, trackingData } = useApp();

    // 1. Calculate Weekly Progress (Last 7 Days)
    const weeklyData = useMemo(() => {
        const days = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });

            let totalScheduled = 0;
            let totalCompleted = 0;

            Object.keys(userProfiles).forEach(username => {
                const userSchedule = schedules[username] || [];
                // Assuming schedule is constant for now (daily template)
                // Realistically we should check schedule snapshots if available, but for now use current schedule
                totalScheduled += userSchedule.reduce((acc, block) => acc + block.tasks.length, 0);

                const userTracking = trackingData[username] || {};

                // Find tracking entries for this date
                userSchedule.forEach(block => {
                    const key = `${dateStr}-${block.id}`;
                    if (userTracking[key]) {
                        totalCompleted += userTracking[key].tasks.length;
                    }
                });
            });

            const completion = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

            days.push({
                name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
                date: dateStr,
                completion,
                scheduled: totalScheduled,
                completed: totalCompleted
            });
        }
        return days;
    }, [userProfiles, schedules, trackingData]);

    // 2. Calculate Operator Performance (All time / Recent)
    const operatorPerformance = useMemo(() => {
        // Calculate over the last 7 days to match the weekly view context
        const last7Days = weeklyData.map(d => d.date);

        return Object.entries(userProfiles).map(([username, profile]) => {
            let totalTasks = 0;
            let completedTasks = 0;
            const userSchedule = schedules[username] || [];
            const userTracking = trackingData[username] || {};

            last7Days.forEach(dateStr => {
                totalTasks += userSchedule.reduce((acc, block) => acc + block.tasks.length, 0);

                userSchedule.forEach(block => {
                    const key = `${dateStr}-${block.id}`;
                    if (userTracking[key]) {
                        completedTasks += userTracking[key].tasks.length;
                    }
                });
            });

            const score = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return {
                name: profile.name.split(' ')[0], // First name only
                fullName: profile.name,
                score,
                tasks: completedTasks
            };
        }).sort((a, b) => b.score - a.score);
    }, [userProfiles, schedules, trackingData, weeklyData]);

    // 3. Task Distribution by Priority/Category
    const taskDistribution = useMemo(() => {
        const distribution: Record<string, number> = {
            'Alta Prioridade': 0,
            'Média Prioridade': 0,
            'Baixa Prioridade': 0
        };

        Object.values(schedules).forEach(userSchedule => {
            userSchedule.forEach(block => {
                if (block.priority === 'high') distribution['Alta Prioridade'] += block.tasks.length;
                else if (block.priority === 'medium') distribution['Média Prioridade'] += block.tasks.length;
                else distribution['Baixa Prioridade'] += block.tasks.length; // Default/Low
            });
        });

        // Filter out zero values and map to chart format
        return Object.entries(distribution)
            .filter(([_, value]) => value > 0)
            .map(([name, value], index) => ({
                name,
                value,
                color: name === 'Alta Prioridade' ? '#EF4444' : name === 'Média Prioridade' ? '#F59E0B' : '#3B82F6'
            }));
    }, [schedules]);

    // Top Stats Calculations
    const currentWeekAvg = Math.round(weeklyData.reduce((acc, d) => acc + d.completion, 0) / 7);
    const totalTasksTracked = weeklyData.reduce((acc, d) => acc + d.completed, 0);
    const reportsGenerated = Object.values(trackingData).reduce((acc, userTracking) => {
        return acc + Object.values(userTracking).filter(t => t.reportSent).length;
    }, 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Relatórios e Análises</h2>
                <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                    <Download className="w-4 h-4" />
                    Exportar PDF
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="p-4">
                    <p className="text-sm text-muted-foreground">Média Semanal (7 dias)</p>
                    <div className="flex items-center justify-between mt-2">
                        <h3 className="text-2xl font-bold">{currentWeekAvg}%</h3>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Atual</span>
                    </div>
                </GlassCard>
                <GlassCard className="p-4">
                    <p className="text-sm text-muted-foreground">Tarefas Concluídas (7 dias)</p>
                    <div className="flex items-center justify-between mt-2">
                        <h3 className="text-2xl font-bold">{totalTasksTracked}</h3>
                        <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">Total</span>
                    </div>
                </GlassCard>
                <GlassCard className="p-4">
                    <p className="text-sm text-muted-foreground">Relatórios Enviados</p>
                    <div className="flex items-center justify-between mt-2">
                        <h3 className="text-2xl font-bold">{reportsGenerated}</h3>
                        <span className="text-xs bg-indigo-500/20 text-indigo-500 px-2 py-1 rounded-full">Total</span>
                    </div>
                </GlassCard>
                <GlassCard className="p-4">
                    <p className="text-sm text-muted-foreground">Equipe Ativa</p>
                    <div className="flex items-center justify-between mt-2">
                        <h3 className="text-2xl font-bold">{Object.keys(userProfiles).length}</h3>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Operadores</span>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Taxa de Conclusão (Últimos 7 dias)</h3>
                        <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyData}>
                                <defs>
                                    <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', color: '#333' }}
                                />
                                <Area type="monotone" dataKey="completion" name="Conclusão (%)" stroke="#8884d8" fillOpacity={1} fill="url(#colorCompletion)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Desempenho por Operador (7 dias)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={operatorPerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} axisLine={false} width={60} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', color: '#333' }}
                                />
                                <Bar dataKey="score" name="Pontuação (%)" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="p-6 lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-6">Distribuição de Prioridades</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={taskDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {taskDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', color: '#333' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Insights da IA</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                            <div className="w-1 h-full bg-primary rounded-full" />
                            <p className="text-sm">
                                A média de conclusão da equipe nesta semana é de <strong>{currentWeekAvg}%</strong>.
                            </p>
                        </div>
                        {operatorPerformance.length > 0 && (
                            <div className="flex gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                                <div className="w-1 h-full bg-primary rounded-full" />
                                <p className="text-sm">
                                    O destaque da semana é <strong>{operatorPerformance[0].fullName}</strong> com <strong>{operatorPerformance[0].score}%</strong> de aproveitamento.
                                </p>
                            </div>
                        )}
                        {taskDistribution.find(t => t.name === 'Alta Prioridade') && (
                            <div className="flex gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                                <div className="w-1 h-full bg-primary rounded-full" />
                                <p className="text-sm">
                                    Existem <strong>{taskDistribution.find(t => t.name === 'Alta Prioridade')?.value}</strong> subtarefas de alta prioridade agendadas no sistema.
                                </p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
