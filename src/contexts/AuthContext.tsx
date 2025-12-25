import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

interface AuthContextType {
    currentUser: string | null;
    isSupervisor: boolean;
    userProfiles: Record<string, UserProfile>;
    supervisorPin: string;
    activeUsers: Set<string>;
    isLoading: boolean;
    login: (username: string) => void;
    validateOperatorPin: (username: string, pin: string) => boolean;
    loginSupervisor: () => void;
    logout: () => void;
    updateProfile: (username: string, profile: UserProfile) => Promise<void>;
    deleteProfile: (username: string) => Promise<void>;
    updateSupervisorPin: (newPin: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [isSupervisor, setIsSupervisor] = useState(false);
    const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
    const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
    const [supervisorPin, setSupervisorPin] = useState('1234');
    const [isLoading, setIsLoading] = useState(true);

    const fetchAuthData = useCallback(async () => {
        try {
            // Fetch profiles
            const { data: profilesData } = await supabase.from('profiles').select('*');

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
                        username: p.username
                    };
                });
                setUserProfiles(profilesMap);
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
            console.error('Error fetching auth data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchAuthData();
    }, [fetchAuthData]);

    // Realtime subscription for authentication data
    useEffect(() => {
        const channel = supabase
            .channel('auth-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchAuthData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'supervisor_settings' }, () => fetchAuthData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchAuthData]);

    // Heartbeat / Presence Logic (Refactored to be cleaner)
    useEffect(() => {
        const HEARTBEAT_TTL = 15000;

        const refreshActiveFromStorage = () => {
            try {
                const heartbeats = JSON.parse(localStorage.getItem('userHeartbeats') || '{}');
                const now = Date.now();
                const active = new Set<string>();
                Object.entries(heartbeats).forEach(([username, ts]) => {
                    if (now - (Number(ts) || 0) < HEARTBEAT_TTL) active.add(username);
                });
                setActiveUsers(active);
            } catch (e) { /* ignore */ }
        };

        refreshActiveFromStorage();
        const interval = setInterval(refreshActiveFromStorage, 5000);
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'userHeartbeats') refreshActiveFromStorage();
        };
        window.addEventListener('storage', onStorage);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    const validateOperatorPin = (username: string, pin: string): boolean => {
        const profile = userProfiles[username];
        if (!profile?.pin) return true; // No pin set means access granted? Or logic from AppContext: if (!profile?.pin) return true;
        return profile.pin === pin;
    };

    const login = async (username: string) => {
        setCurrentUser(username);
        setIsSupervisor(false);

        // Set heartbeat
        try {
            const hb = JSON.parse(localStorage.getItem('userHeartbeats') || '{}');
            hb[username] = Date.now();
            localStorage.setItem('userHeartbeats', JSON.stringify(hb));
        } catch (e) { console.warn('Heartbeat error', e); }

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
        const user = currentUser;

        if (user) {
            try {
                const hb = JSON.parse(localStorage.getItem('userHeartbeats') || '{}');
                delete hb[user];
                localStorage.setItem('userHeartbeats', JSON.stringify(hb));
            } catch (e) { /* ignore */ }
        }

        await supabase.from('activity_logs').insert({
            username: user || 'supervisor',
            action: 'login',
            details: 'Saiu do sistema',
        });

        setCurrentUser(null);
        setIsSupervisor(false);
    };

    const updateProfile = async (username: string, profile: UserProfile) => {
        const { data: existing } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .maybeSingle();

        const payload = {
            username,
            name: profile.name,
            role: 'operator',
            position: profile.role, // role in UI maps to position in DB? AppContext logic: role: profile.role === 'operator' ? 'operator' : 'operator', position: profile.role
            color: profile.color,
            avatar: profile.avatar,
            pin: profile.pin || null,
        };

        if (existing) {
            await supabase.from('profiles').update(payload).eq('username', username);
        } else {
            await supabase.from('profiles').insert(payload);
        }

        await supabase.from('activity_logs').insert({
            username: 'supervisor',
            action: 'profile_edit',
            details: `Atualizou perfil de ${profile.name}`,
        });

        fetchAuthData();
    };

    const deleteProfile = async (username: string) => {
        const profile = userProfiles[username];
        await supabase.from('profiles').delete().eq('username', username);

        await supabase.from('activity_logs').insert({
            username: 'supervisor',
            action: 'profile_edit',
            details: `Removeu perfil de ${profile?.name || username}`,
        });
        fetchAuthData();
    };

    const updateSupervisorPin = async (newPin: string) => {
        await supabase
            .from('supervisor_settings')
            .update({ supervisor_pin: newPin })
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Safety check?
        setSupervisorPin(newPin);
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isSupervisor,
                userProfiles,
                supervisorPin,
                activeUsers,
                isLoading,
                login,
                validateOperatorPin,
                loginSupervisor,
                logout,
                updateProfile,
                deleteProfile,
                updateSupervisorPin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
