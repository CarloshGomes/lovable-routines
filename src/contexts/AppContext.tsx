import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  name: string;
  role: string;
  color: string;
  avatar: string;
  position?: string;
  pin?: string;
}

export interface ScheduleBlock {
  id: string;
  time: number;
  label: string;
  tasks: string[];
  priority?: 'high' | 'medium';
  category?: 'sistema' | 'monitoramento' | 'organização' | 'comunicação';
  type?: 'break';
}

export interface TrackingData {
  tasks: number[];
  report: string;
  reportSent: boolean;
  timestamp: string;
}

export type ScheduleSnapshots = Record<string, Record<string, ScheduleBlock[]>>;

export interface ActivityLog {
  id: number;
  type: 'login' | 'report_sent' | 'schedule_edit' | 'profile_edit';
  user: string;
  message: string;
  timestamp: string;
  metadata?: any;
}

interface AppContextType {
  currentUser: string | null;
  isSupervisor: boolean;
  userProfiles: Record<string, UserProfile>;
  schedules: Record<string, ScheduleBlock[]>;
  scheduleSnapshots: ScheduleSnapshots;
  trackingData: Record<string, Record<string, TrackingData>>;
  activityLog: ActivityLog[];
  supervisorPin: string;
  activeUsers: Set<string>;
  isLoading: boolean;
  login: (username: string) => void;
  validateOperatorPin: (username: string, pin: string) => boolean;
  loginSupervisor: () => void;
  logout: () => void;
  updateProfile: (username: string, profile: UserProfile) => void;
  deleteProfile: (username: string) => void;
  updateSchedule: (username: string, schedule: ScheduleBlock[], options?: { preserveDays?: number }) => void;
  updateTracking: (username: string, blockId: string, data: TrackingData) => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  updateSupervisorPin: (newPin: string) => void;
  exportData: () => void;
  importData: (data: any) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [schedules, setSchedules] = useState<Record<string, ScheduleBlock[]>>({});
  const [trackingData, setTrackingData] = useState<Record<string, Record<string, TrackingData>>>({});
  const [scheduleSnapshots, setScheduleSnapshots] = useState<ScheduleSnapshots>({});
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [supervisorPin, setSupervisorPin] = useState('1234');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data from database
  const fetchData = useCallback(async () => {
    try {
      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesData) {
        const profilesMap: Record<string, UserProfile> = {};
        profilesData.forEach(p => {
          profilesMap[p.username] = {
            name: p.name,
            role: p.position || p.role,
            color: p.color || '#3B82F6',
            avatar: p.avatar || '👤',
            position: p.position,
            pin: p.pin || undefined,
          };
        });
        setUserProfiles(profilesMap);
      }

      // Fetch schedules
      const { data: schedulesData } = await supabase
        .from('schedule_blocks')
        .select('*');
      
      if (schedulesData) {
        const schedulesMap: Record<string, ScheduleBlock[]> = {};
        schedulesData.forEach(s => {
          if (!schedulesMap[s.username]) {
            schedulesMap[s.username] = [];
          }
          // Parse time from "HH:00" format to number
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
        // Garantir ordem consistente por horário para evitar reposicionamento
        Object.keys(schedulesMap).forEach((username) => {
          schedulesMap[username].sort((a, b) => a.time - b.time);
        });

        // Garantir ordem consistente por horário para evitar reposicionamento
        Object.keys(schedulesMap).forEach((username) => {
          schedulesMap[username].sort((a, b) => a.time - b.time);
        });

        setSchedules(schedulesMap);
      }

      // Fetch schedule snapshots
      const { data: snapshotsData } = await supabase
        .from('schedule_snapshots')
        .select('*');

      if (snapshotsData) {
        const snapshotsMap: ScheduleSnapshots = {};
        snapshotsData.forEach(s => {
          if (!snapshotsMap[s.username]) snapshotsMap[s.username] = {};
          const dateKey = s.snapshot_date; // YYYY-MM-DD
          snapshotsMap[s.username][dateKey] = s.blocks || [];
        });
        setScheduleSnapshots(snapshotsMap);
      }

      // Fetch tracking data
      const { data: trackingDataDb } = await supabase
        .from('tracking_data')
        .select('*');
      
      if (trackingDataDb) {
        const trackingMap: Record<string, Record<string, TrackingData>> = {};
        trackingDataDb.forEach(t => {
          if (!trackingMap[t.username]) {
            trackingMap[t.username] = {};
          }
          // completed_tasks stored as ['task-0','task-2',...]
          const parsedTasks: number[] = (t.completed_tasks || []).map((s: string) => {
            const m = String(s).match(/task-(\d+)/);
            return m ? parseInt(m[1], 10) : NaN;
          }).filter((n: number) => !isNaN(n));

          trackingMap[t.username][t.tracking_key] = {
            tasks: parsedTasks,
            report: t.notes || '',
            reportSent: !!t.notes,
            timestamp: t.updated_at,
          };
        });
        setTrackingData(trackingMap);
      }

      // Fetch activity logs
      const { data: logsData } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      
      if (logsData) {
        setActivityLog(logsData.map(l => ({
          id: Date.parse(l.timestamp),
          type: l.action as any,
          user: l.username,
          message: l.details || '',
          timestamp: l.timestamp,
        })));
      }

      // Fetch supervisor settings
      const { data: settingsData } = await supabase
        .from('supervisor_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (settingsData) {
        setSupervisorPin(settingsData.supervisor_pin);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule_blocks' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tracking_data' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const validateOperatorPin = (username: string, pin: string): boolean => {
    const profile = userProfiles[username];
    if (!profile?.pin) return true;
    return profile.pin === pin;
  };

  const login = async (username: string) => {
    setCurrentUser(username);
    setIsSupervisor(false);
    setActiveUsers((prev) => new Set(prev).add(username));
    
    // Add activity log to database
    await supabase.from('activity_logs').insert({
      username,
      action: 'login',
      details: 'Entrou no sistema',
    });
  };

  const loginSupervisor = async () => {
    setIsSupervisor(true);
    setCurrentUser(null);
    
    await supabase.from('activity_logs').insert({
      username: 'supervisor',
      action: 'login',
      details: 'Acessou o painel supervisor',
    });
  };

  const logout = async () => {
    const userName = currentUser ? userProfiles[currentUser]?.name : 'Supervisor';
    
    if (currentUser) {
      setActiveUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentUser);
        return newSet;
      });
    }
    
    await supabase.from('activity_logs').insert({
      username: currentUser || 'supervisor',
      action: 'login',
      details: 'Saiu do sistema',
    });
    
    setCurrentUser(null);
    setIsSupervisor(false);
  };

  const updateProfile = async (username: string, profile: UserProfile) => {
    // Check if profile exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('profiles')
        .update({
          name: profile.name,
          role: profile.role === 'operator' ? 'operator' : 'operator',
          position: profile.role,
          color: profile.color,
          avatar: profile.avatar,
          pin: profile.pin || null,
        })
        .eq('username', username);
    } else {
      await supabase
        .from('profiles')
        .insert({
          username,
          name: profile.name,
          role: 'operator',
          position: profile.role,
          color: profile.color,
          avatar: profile.avatar,
          pin: profile.pin || null,
        });
    }

    await supabase.from('activity_logs').insert({
      username: 'supervisor',
      action: 'profile_edit',
      details: `Atualizou perfil de ${profile.name}`,
    });

    fetchData();
  };

  const deleteProfile = async (username: string) => {
    const profile = userProfiles[username];
    
    await supabase
      .from('profiles')
      .delete()
      .eq('username', username);

    await supabase.from('activity_logs').insert({
      username: 'supervisor',
      action: 'profile_edit',
      details: `Removeu perfil de ${profile?.name || username}`,
    });

    fetchData();
  };

  const updateSchedule = async (username: string, schedule: ScheduleBlock[], options?: { preserveDays?: number }) => {
    // If preserveDays option is provided (>0), preserve the existing template for the last N days
    const preserveDays = options?.preserveDays ?? 0;
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

          // For each day in the range [1..preserveDays], upsert snapshot if missing
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
                blocks: oldSchedule,
              });

              // Update local snapshots state
              setScheduleSnapshots(prev => ({
                ...prev,
                [username]: {
                  ...(prev[username] || {}),
                  [date]: oldSchedule,
                }
              }));
            }
          }
        }
      } catch (err) {
        console.warn('Erro ao preservar snapshots anteriores:', err);
      }
    }

    // Delete existing schedules for user
    await supabase
      .from('schedule_blocks')
      .delete()
      .eq('username', username);

    // Insert new schedules
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

    // Also upsert a snapshot for today's date so historical views are preserved
    try {
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('schedule_snapshots').upsert({
        username,
        snapshot_date: today,
        blocks: schedule,
      }, { onConflict: ['username', 'snapshot_date'] });

      // Update local snapshots state
      setScheduleSnapshots(prev => ({
        ...prev,
        [username]: {
          ...(prev[username] || {}),
          [today]: schedule,
        }
      }));
    } catch (err) {
      console.warn('Erro ao salvar snapshot de rotina:', err);
    }

    await supabase.from('activity_logs').insert({
      username: 'supervisor',
      action: 'schedule_edit',
      details: `Atualizou rotina de ${userProfiles[username]?.name || username}`,
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

    if (existing) {
      await supabase
        .from('tracking_data')
        .update({
          completed_tasks: completedTasks,
          notes: data.report,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('tracking_data').insert({
        tracking_key: trackingKey,
        username,
        completed_tasks: completedTasks,
        notes: data.report,
      });
    }

    if (data.reportSent) {
      await supabase.from('activity_logs').insert({
        username,
        action: 'report_sent',
        details: `Enviou relatório do bloco ${blockId}`,
      });
    }

    fetchData();
  };

  const addActivityLog = async (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    await supabase.from('activity_logs').insert({
      username: log.user,
      action: log.type,
      details: log.message,
    });

    fetchData();
  };

  const updateSupervisorPin = async (newPin: string) => {
    await supabase
      .from('supervisor_settings')
      .update({ supervisor_pin: newPin })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    setSupervisorPin(newPin);
  };

  const exportData = () => {
    const data = {
      userProfiles,
      schedules,
      trackingData,
      activityLog,
      supervisorPin,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (data: any) => {
    // Import profiles
    if (data.userProfiles) {
      for (const [username, profile] of Object.entries(data.userProfiles)) {
        const p = profile as UserProfile;
        await supabase.from('profiles').upsert({
          username,
          name: p.name,
          role: 'operator',
          position: p.role,
          color: p.color,
          avatar: p.avatar,
          pin: p.pin || null,
        }, { onConflict: 'username' });
      }
    }

    fetchData();
  };

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isSupervisor,
        userProfiles,
        schedules,
        trackingData,
        scheduleSnapshots,
        activityLog,
        supervisorPin,
        activeUsers,
        isLoading,
        login,
        validateOperatorPin,
        loginSupervisor,
        logout,
        updateProfile,
        deleteProfile,
        updateSchedule,
        updateTracking,
        addActivityLog,
        updateSupervisorPin,
        exportData,
        importData,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
