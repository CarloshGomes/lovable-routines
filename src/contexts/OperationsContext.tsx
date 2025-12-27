import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScheduleBlock, TrackingData, ScheduleSnapshots } from '@/types/operations';
import { REASON_LABELS } from '@/constants/operations';
import { UserProfile } from '@/types/auth'; // Needed for logs details if keeping logs here? Logs likely belong to System or split.
// Actually AppContext kept logs. I'll duplicate addActivityLog logic or assume ActivityContext later?
// For now, I'll keep activity logging inside the operations actions by writing directly to Supabase, consistent with AuthContext.

interface OperationsContextType {
    schedules: Record<string, ScheduleBlock[]>;
    scheduleSnapshots: ScheduleSnapshots;
    trackingData: Record<string, Record<string, TrackingData>>;
    isLoading: boolean;
    updateSchedule: (username: string, schedule: ScheduleBlock[], options?: { preserveDays?: number }) => Promise<void>;
    updateTracking: (username: string, blockId: string, data: TrackingData) => Promise<void>;
    refreshOperations: () => Promise<void>;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const OperationsProvider = ({ children }: { children: ReactNode }) => {
    const [schedules, setSchedules] = useState<Record<string, ScheduleBlock[]>>({});
    const [trackingData, setTrackingData] = useState<Record<string, Record<string, TrackingData>>>({});
    const [scheduleSnapshots, setScheduleSnapshots] = useState<ScheduleSnapshots>({});
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            // Fetch schedules
            const { data: schedulesData } = await supabase.from('schedule_blocks').select('*');
            if (schedulesData) {
                const schedulesMap: Record<string, ScheduleBlock[]> = {};
                schedulesData.forEach(s => {
                    if (!schedulesMap[s.username]) schedulesMap[s.username] = [];

                    const timeMatch = s.time.match(/^(\d{1,2})/);
                    const timeNum = timeMatch ? parseInt(timeMatch[1]) : 7;

                    schedulesMap[s.username].push({
                        id: s.block_id,
                        time: timeNum,
                        label: s.time,
                        tasks: s.tasks || [],
                        priority: s.color === '#EF4444' ? 'high' : 'medium',
                        category: 'sistema',
                    });
                });
                Object.keys(schedulesMap).forEach((username) => {
                    schedulesMap[username].sort((a, b) => a.time - b.time);
                });
                setSchedules(schedulesMap);
            }

            // Fetch snapshots
            const { data: snapshotsData } = await supabase.from('schedule_snapshots').select('*');
            if (snapshotsData) {
                const snapshotsMap: ScheduleSnapshots = {};
                snapshotsData.forEach(s => {
                    if (!snapshotsMap[s.username]) snapshotsMap[s.username] = {};
                    const dateKey = s.snapshot_date;
                    // Cast Json to ScheduleBlock[]
                    snapshotsMap[s.username][dateKey] = (s.blocks as unknown as ScheduleBlock[]) || [];
                });
                setScheduleSnapshots(snapshotsMap);
            }

            // Fetch tracking
            const { data: trackingDataDb } = await supabase.from('tracking_data').select('*');
            if (trackingDataDb) {
                const trackingMap: Record<string, Record<string, TrackingData>> = {};
                trackingDataDb.forEach((t: any) => {
                    if (!trackingMap[t.username]) trackingMap[t.username] = {};

                    const parsedTasks: number[] = (t.completed_tasks || []).map((s: string) => {
                        const m = String(s).match(/task-(\d+)/);
                        return m ? parseInt(m[1], 10) : NaN;
                    }).filter((n: number) => !isNaN(n));

                    // Try to parse notes as JSON for justification data
                    let justificationData: any = {};
                    if (t.notes) {
                        try {
                            const parsed = JSON.parse(t.notes);
                            if (parsed.delayReason) {
                                justificationData = parsed;
                            }
                        } catch (e) {
                            // Not JSON, treat as regular note
                        }
                    }

                    trackingMap[t.username][t.tracking_key] = {
                        tasks: parsedTasks,
                        report: justificationData.delayReason ? (justificationData.report || '') : (t.notes || ''),
                        reportSent: justificationData.delayReason ? !!justificationData.report : !!t.notes,
                        timestamp: t.updated_at,
                        // Add justification fields from parsed JSON
                        delayReason: justificationData.delayReason || undefined,
                        isImpossible: justificationData.isImpossible || false,
                        escalated: justificationData.escalated || false,
                    };
                });
                setTrackingData(trackingMap);
            }

        } catch (error) {
            console.error('Error fetching operations data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const channel = supabase.channel('operations-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule_blocks' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tracking_data' }, () => fetchData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchData]);

    const updateSchedule = async (username: string, schedule: ScheduleBlock[], options?: { preserveDays?: number }) => {
        const preserveDays = options?.preserveDays ?? 0;

        // Logic for preserving history
        if (preserveDays > 0) {
            try {
                const { data: existingBlocks } = await supabase
                    .from('schedule_blocks')
                    .select('*')
                    .eq('username', username);

                if (existingBlocks && existingBlocks.length > 0) {
                    const oldSchedule: ScheduleBlock[] = existingBlocks.map((s: any) => {
                        const timeMatch = (s.time || '').toString().match(/^(\d{1,2})/);
                        const timeNum = timeMatch ? parseInt(timeMatch[1]) : 7;
                        return {
                            id: s.block_id,
                            time: timeNum,
                            label: s.time,
                            tasks: s.tasks || [],
                            priority: s.color === '#EF4444' ? 'high' : 'medium',
                            category: 'sistema',
                        } as ScheduleBlock;
                    });

                    for (let i = 1; i <= preserveDays; i++) {
                        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        const { data: existingSnapshot } = await supabase
                            .from('schedule_snapshots')
                            .select('id')
                            .eq('username', username)
                            .eq('snapshot_date', date)
                            .maybeSingle();

                        if (!existingSnapshot) {
                            await supabase.from('schedule_snapshots').insert({
                                username,
                                snapshot_date: date,
                                blocks: oldSchedule as any,
                            });
                            setScheduleSnapshots(prev => ({
                                ...prev,
                                [username]: { ...(prev[username] || {}), [date]: oldSchedule }
                            }));
                        }
                    }
                }
            } catch (err) { console.warn('Error preserving snapshots:', err); }
        }

        // Replace schedule
        await supabase.from('schedule_blocks').delete().eq('username', username);

        if (schedule.length > 0) {
            const schedulesToInsert = schedule.map(s => ({
                block_id: s.id,
                username,
                time: s.label || `${String(s.time).padStart(2, '0')}:00`,
                title: s.tasks[0] || 'Sem título',
                duration: 60,
                color: s.priority === 'high' ? '#EF4444' : '#3B82F6',
                tasks: s.tasks,
            }));
            await supabase.from('schedule_blocks').insert(schedulesToInsert);
        }

        // Snapshot today
        try {
            const today = new Date().toISOString().split('T')[0];
            await supabase.from('schedule_snapshots').upsert({
                username,
                snapshot_date: today,
                blocks: schedule as any,
            }, { onConflict: 'username, snapshot_date' });

            setScheduleSnapshots(prev => ({
                ...prev,
                [username]: { ...(prev[username] || {}), [today]: schedule }
            }));
        } catch (err) { console.warn('Error saving snapshot:', err); }

        // Log activity
        // Note: We don't have userProfiles here to get the 'name'. We just use username.
        // Ideally we'd get profile name, but avoiding Auth Context dependency loop.
        // Or we accept we just log username.
        await supabase.from('activity_logs').insert({
            username: 'supervisor', // Assuming only supervisor edits schedules?
            action: 'schedule_edit',
            details: `Atualizou rotina de ${username}`,
        });

        fetchData();
    };

    const updateTracking = async (username: string, blockId: string, data: TrackingData) => {
        const today = new Date().toISOString().split('T')[0];
        const trackingKey = `${today}-${blockId}`;

        const { data: existing } = await supabase
            .from('tracking_data')
            .select('id')
            .eq('tracking_key', trackingKey)
            .eq('username', username)
            .maybeSingle();

        const completedTasks = data.tasks.map(i => `task-${i}`);

        // If we have justification data, store it as JSON in notes
        let notesValue = data.report;
        if (data.delayReason || data.isImpossible || data.escalated) {
            notesValue = JSON.stringify({
                report: data.report,
                delayReason: data.delayReason,
                isImpossible: data.isImpossible,
                escalated: data.escalated,
                timestamp: data.timestamp || new Date().toISOString()
            });
        }

        const trackingPayload = {
            completed_tasks: completedTasks,
            notes: notesValue,
        };

        if (existing) {
            await supabase.from('tracking_data').update(trackingPayload).eq('id', existing.id);
        } else {
            await supabase.from('tracking_data').insert({
                tracking_key: trackingKey,
                username,
                ...trackingPayload,
            });
        }

        if (data.reportSent) {
            await supabase.from('activity_logs').insert({
                username,
                action: 'report_sent',
                details: `Enviou relatório do bloco ${blockId}`,
            });
        }

        // Log justification if sent
        if (data.delayReason) {
            const reasonLabel = REASON_LABELS[data.delayReason] || data.delayReason;
            await supabase.from('activity_logs').insert({
                username,
                action: 'justification_sent',
                details: `Enviou justificativa: ${reasonLabel}${data.isImpossible ? ' (Impossível)' : ''}`,
            });
        }

        fetchData();
    };

    return (
        <OperationsContext.Provider value={{
            schedules,
            scheduleSnapshots,
            trackingData,
            isLoading,
            updateSchedule,
            updateTracking,
            refreshOperations: fetchData
        }}>
            {children}
        </OperationsContext.Provider>
    );
};

export const useOperations = () => {
    const context = useContext(OperationsContext);
    if (!context) throw new Error('useOperations must be used within OperationsProvider');
    return context;
};
