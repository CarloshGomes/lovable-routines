import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { useApp } from '@/contexts/AppContext';

interface UseDashboardNotificationsProps {
    lateOperatorsData: { username: string; lateBlocks: any[] }[];
}

export const useDashboardNotifications = ({ lateOperatorsData }: UseDashboardNotificationsProps) => {
    const { userProfiles, trackingData, schedules } = useApp();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const notifiedRef = useRef<Set<string>>(new Set());
    const today = new Date().toISOString().split('T')[0];

    const {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll
    } = useNotifications();

    // Initialize notifiedRef logic (only once per day mount in reality, but effect handles updates)
    useEffect(() => {
        try {
            const stored = localStorage.getItem('sent_late_notifications');
            if (stored) {
                const parsed = JSON.parse(stored);
                const todayKeys = parsed.filter((k: string) => k.startsWith(today));
                todayKeys.forEach((k: string) => notifiedRef.current.add(k));
            }
        } catch (e) {
            console.error('Failed to load sent notifications history', e);
        }
    }, [today]);

    // Late Tasks Check
    useEffect(() => {
        let hasUpdates = false;

        lateOperatorsData.forEach(({ username, lateBlocks }) => {
            lateBlocks.forEach((block) => {
                const notificationKey = `${today}-${username}-${block.id}`;

                if (!notifiedRef.current.has(notificationKey)) {
                    notifiedRef.current.add(notificationKey);
                    hasUpdates = true;

                    const operatorName = userProfiles[username]?.name || username;

                    addNotification(
                        `Tarefa Atrasada: ${operatorName}`,
                        `${block.label} não foi concluído no horário previsto`,
                        'warning',
                        { notificationKey }
                    );

                    if (notificationsEnabled) {
                        toast.error(`Tarefa Atrasada: ${operatorName}`, {
                            description: `${block.label} não foi concluído no horário previsto`,
                            duration: 8000,
                            // Note: We can't pass the exact JSX icon component easily if not imported here within the toast function context, 
                            // but sonner usually supports it or we rely on default styles or imported AlertTriangle.
                            // Assuming standard sonner usage or simple strings if JSX fails in hook isolation (it shouldn't).
                        });
                    }
                }
            });
        });

        if (hasUpdates) {
            localStorage.setItem('sent_late_notifications', JSON.stringify(Array.from(notifiedRef.current)));
        }
    }, [lateOperatorsData, notificationsEnabled, today, userProfiles, addNotification]);

    // Justifications Check
    useEffect(() => {
        let hasJustificationUpdates = false;

        Object.entries(trackingData).forEach(([username, userTracking]) => {
            const profile = userProfiles[username];
            const schedule = schedules[username] || [];

            Object.entries(userTracking).forEach(([key, tracking]: [string, any]) => {
                if (key.startsWith(today) && tracking.delayReason) {
                    const blockId = key.substring(11);
                    const block = schedule.find(b => b.id === blockId);

                    if (block) {
                        const justificationKey = `justification-${today}-${username}-${blockId}`;

                        if (!notifiedRef.current.has(justificationKey)) {
                            notifiedRef.current.add(justificationKey);
                            hasJustificationUpdates = true;

                            const operatorName = profile?.name || username;
                            const reasonLabels: Record<string, string> = {
                                high_demand: 'Alta Demanda',
                                system_slowness: 'Sistema Lento',
                                external_factor: 'Fator Externo',
                                break_adjustment: 'Intervalo',
                                other: 'Outro',
                                impossible_to_complete: 'Impossível de Completar'
                            };
                            const reasonLabel = reasonLabels[tracking.delayReason] || tracking.delayReason;

                            addNotification(
                                `Justificativa: ${operatorName}`,
                                `${block.label} - ${reasonLabel}`,
                                tracking.isImpossible ? 'error' : 'warning',
                                { justificationKey, username, blockId, reason: tracking.delayReason }
                            );

                            if (notificationsEnabled) {
                                const toastFn = tracking.isImpossible ? toast.error : toast.warning;
                                toastFn(`Justificativa Recebida: ${operatorName}`, {
                                    description: `${block.label} - ${reasonLabel}`,
                                    duration: 10000,
                                });
                            }
                        }
                    }
                }
            });
        });

        if (hasJustificationUpdates) {
            localStorage.setItem('sent_late_notifications', JSON.stringify(Array.from(notifiedRef.current)));
        }
    }, [trackingData, schedules, userProfiles, notificationsEnabled, today, addNotification]);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        notificationsEnabled,
        setNotificationsEnabled
    };
};
