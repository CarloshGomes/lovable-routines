import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface UserProfile {
  name: string;
  role: string;
  color: string;
  avatar: string;
  email: string;
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
  trackingData: Record<string, Record<string, TrackingData>>;
  activityLog: ActivityLog[];
  supervisorPin: string;
  activeUsers: Set<string>;
  login: (username: string) => void;
  loginSupervisor: () => void;
  logout: () => void;
  updateProfile: (username: string, profile: UserProfile) => void;
  deleteProfile: (username: string) => void;
  updateSchedule: (username: string, schedule: ScheduleBlock[]) => void;
  updateTracking: (username: string, blockId: string, data: TrackingData) => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  updateSupervisorPin: (newPin: string) => void;
  exportData: () => void;
  importData: (data: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultProfiles: Record<string, UserProfile> = {
  isabela: {
    name: 'Isabela',
    role: 'Operador de Tratativas',
    color: 'purple',
    avatar: '👩‍💼',
    email: 'isabela@empresa.com',
  },
  rhyan: {
    name: 'Rhyan',
    role: 'Operador de Rotinas',
    color: 'indigo',
    avatar: '👨‍💼',
    email: 'rhyan@empresa.com',
  },
};

const defaultSchedules: Record<string, ScheduleBlock[]> = {
  isabela: [
    {
      id: 'isabela-7-1',
      time: 7,
      label: '07:00 - 08:00',
      tasks: ['Verificar e-mails prioritários', 'Analisar dashboard de KPIs'],
      priority: 'high',
      category: 'sistema',
    },
    {
      id: 'isabela-8-1',
      time: 8,
      label: '08:00 - 09:00',
      tasks: ['Processar tratativas pendentes', 'Atualizar status de tickets'],
      priority: 'high',
      category: 'sistema',
    },
    {
      id: 'isabela-9-1',
      time: 9,
      label: '09:00 - 10:00',
      tasks: ['Reunião de alinhamento', 'Review de processos'],
      priority: 'medium',
      category: 'comunicação',
    },
    {
      id: 'isabela-10-1',
      time: 10,
      label: '10:00 - 11:00',
      tasks: ['Intervalo', 'Coffee break'],
      type: 'break',
      category: 'organização',
    },
  ],
  rhyan: [
    {
      id: 'rhyan-7-1',
      time: 7,
      label: '07:00 - 08:00',
      tasks: ['Check-in de sistemas', 'Verificar logs de monitoramento'],
      priority: 'high',
      category: 'monitoramento',
    },
    {
      id: 'rhyan-8-1',
      time: 8,
      label: '08:00 - 09:00',
      tasks: ['Executar rotinas programadas', 'Validar backups'],
      priority: 'high',
      category: 'sistema',
    },
  ],
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(() => {
    const stored = localStorage.getItem('userProfiles');
    return stored ? JSON.parse(stored) : defaultProfiles;
  });
  const [schedules, setSchedules] = useState<Record<string, ScheduleBlock[]>>(() => {
    const stored = localStorage.getItem('appSchedules');
    return stored ? JSON.parse(stored) : defaultSchedules;
  });
  const [trackingData, setTrackingData] = useState<Record<string, Record<string, TrackingData>>>(() => {
    const stored = localStorage.getItem('trackingData');
    const data = stored ? JSON.parse(stored) : {};
    // Migrar dados antigos de number para string se necessário
    return data;
  });
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(() => {
    const stored = localStorage.getItem('activityLog');
    return stored ? JSON.parse(stored) : [];
  });
  const [supervisorPin, setSupervisorPin] = useState(() => {
    const stored = localStorage.getItem('supervisorPin');
    return stored || '1234';
  });

  useEffect(() => {
    localStorage.setItem('userProfiles', JSON.stringify(userProfiles));
  }, [userProfiles]);

  useEffect(() => {
    localStorage.setItem('appSchedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('trackingData', JSON.stringify(trackingData));
  }, [trackingData]);

  useEffect(() => {
    localStorage.setItem('activityLog', JSON.stringify(activityLog.slice(-100)));
  }, [activityLog]);

  useEffect(() => {
    localStorage.setItem('supervisorPin', supervisorPin);
  }, [supervisorPin]);

  const login = (username: string) => {
    setCurrentUser(username);
    setIsSupervisor(false);
    setActiveUsers((prev) => new Set(prev).add(username));
    addActivityLog({
      type: 'login',
      user: userProfiles[username]?.name || username,
      message: 'Entrou no sistema',
    });
  };

  const loginSupervisor = () => {
    setIsSupervisor(true);
    setCurrentUser(null);
    addActivityLog({
      type: 'login',
      user: 'Supervisor',
      message: 'Acessou o painel supervisor',
    });
  };

  const logout = () => {
    const userName = currentUser ? userProfiles[currentUser]?.name : 'Supervisor';
    if (currentUser) {
      setActiveUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentUser);
        return newSet;
      });
    }
    addActivityLog({
      type: 'login',
      user: userName,
      message: 'Saiu do sistema',
    });
    setCurrentUser(null);
    setIsSupervisor(false);
  };

  const updateProfile = (username: string, profile: UserProfile) => {
    setUserProfiles((prev) => ({ ...prev, [username]: profile }));
    addActivityLog({
      type: 'profile_edit',
      user: 'Supervisor',
      message: `Atualizou perfil de ${profile.name}`,
    });
  };

  const deleteProfile = (username: string) => {
    const profile = userProfiles[username];
    setUserProfiles((prev) => {
      const newProfiles = { ...prev };
      delete newProfiles[username];
      return newProfiles;
    });
    setSchedules((prev) => {
      const newSchedules = { ...prev };
      delete newSchedules[username];
      return newSchedules;
    });
    addActivityLog({
      type: 'profile_edit',
      user: 'Supervisor',
      message: `Removeu perfil de ${profile.name}`,
    });
  };

  const updateSchedule = (username: string, schedule: ScheduleBlock[]) => {
    setSchedules((prev) => ({ ...prev, [username]: schedule }));
    addActivityLog({
      type: 'schedule_edit',
      user: 'Supervisor',
      message: `Atualizou rotina de ${userProfiles[username]?.name}`,
    });
  };

  const updateTracking = (username: string, blockId: string, data: TrackingData) => {
    // Add today's date to the key to make each day independent
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dateBlockId = `${today}-${blockId}`;
    
    setTrackingData((prev) => ({
      ...prev,
      [username]: {
        ...(prev[username] || {}),
        [dateBlockId]: data,
      },
    }));
    if (data.reportSent) {
      addActivityLog({
        type: 'report_sent',
        user: userProfiles[username]?.name || username,
        message: `Enviou relatório do bloco ${blockId}`,
      });
    }
  };

  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
    setActivityLog((prev) => [newLog, ...prev].slice(0, 100));
  };

  const updateSupervisorPin = (newPin: string) => {
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

  const importData = (data: any) => {
    if (data.userProfiles) setUserProfiles(data.userProfiles);
    if (data.schedules) setSchedules(data.schedules);
    if (data.trackingData) setTrackingData(data.trackingData);
    if (data.activityLog) setActivityLog(data.activityLog);
    if (data.supervisorPin) setSupervisorPin(data.supervisorPin);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isSupervisor,
        userProfiles,
        schedules,
        trackingData,
        activityLog,
        supervisorPin,
        activeUsers,
        login,
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
