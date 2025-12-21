import { LayoutDashboard, Users, Calendar, Settings, BarChart } from 'lucide-react';

export const SUPERVISOR_TABS = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'analytics', label: 'Relatórios', icon: BarChart },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'routines', label: 'Rotinas', icon: Calendar },
    { id: 'settings', label: 'Ajustes', icon: Settings },
] as const;

export type SupervisorTabId = typeof SUPERVISOR_TABS[number]['id'];

export const STATUS_CONFIG = {
    completed: {
        style: 'bg-success/20 border-success/50',
        label: 'Concluído',
        icon: '✓'
    },
    late: {
        style: 'bg-danger/20 border-danger/50',
        label: 'Atrasado',
        icon: '⚠️'
    },
    current: {
        style: 'bg-primary/20 border-primary/50',
        label: 'Em Andamento',
        icon: '▶️'
    },
    pending: {
        style: 'bg-muted',
        label: 'Aguardando',
        icon: '⏳'
    }
} as const;
