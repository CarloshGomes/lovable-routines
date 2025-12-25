import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useOperations } from './OperationsContext';
import { UserProfile } from '@/types/auth';
import { ScheduleBlock, TrackingData, ScheduleSnapshots } from '@/types/operations';
import { ActivityLog } from '@/types/system';

export type { UserProfile } from '@/types/auth'; // Re-export for compatibility
export type { ScheduleBlock, TrackingData, ScheduleSnapshots } from '@/types/operations';
export type { ActivityLog } from '@/types/system';

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
  const {
    currentUser,
    isSupervisor,
    activeUsers,
    userProfiles,
    supervisorPin,
    login,
    validateOperatorPin,
    loginSupervisor,
    logout,
    updateProfile,
    deleteProfile,
    updateSupervisorPin,
    isLoading: authLoading
  } = useAuth();

  const {
    schedules,
    scheduleSnapshots,
    trackingData,
    updateSchedule,
    updateTracking,
    isLoading: opsLoading,
    refreshOperations
  } = useOperations();

  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch only System data (Activity Logs) here now
  const fetchData = useCallback(async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to realtime changes (Activity Logs only)
  useEffect(() => {
    const channel = supabase
      .channel('app-system-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);


  // Auth functions removed and delegated to AuthContext

  // Operations functions removed and delegated to OperationsContext

  const addActivityLog = async (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    await supabase.from('activity_logs').insert({
      username: log.user,
      action: log.type,
      details: log.message,
    });

    fetchData();
  };

  // function removed: updateSupervisorPin is now imported from useAuth

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
    await Promise.all([fetchData(), refreshOperations()]);
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
        isLoading: isLoading || authLoading || opsLoading,
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
