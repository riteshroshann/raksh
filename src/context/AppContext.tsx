import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import type { AppUser, FamilyMember, Profile } from '../lib/types';

interface AppContextValue {
  
  user: AppUser | null;
  
  activeMemberId: string | null;
  setActiveMemberId: (id: string | null) => void;
  familyMembers: FamilyMember[];
  
  refreshProfile: () => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  authLoading: boolean;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('raksh-dark-mode') === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('raksh-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as Profile;
  }, []);

  const fetchFamilyMembers = useCallback(async (userId: string): Promise<FamilyMember[]> => {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at');
    if (error) return [];
    return (data ?? []) as FamilyMember[];
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const [profile, members] = await Promise.all([
      fetchProfile(user.id),
      fetchFamilyMembers(user.id),
    ]);
    setUser(prev => prev ? { ...prev, profile } : null);
    setFamilyMembers(members);
  }, [user, fetchProfile, fetchFamilyMembers]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user && mounted) {
        const [profile, members] = await Promise.all([
          fetchProfile(session.user.id),
          fetchFamilyMembers(session.user.id),
        ]);
        setUser({ id: session.user.id, email: session.user.email ?? '', profile });
        setFamilyMembers(members);
      }

      if (mounted) setAuthLoading(false);
    };

    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        const [profile, members] = await Promise.all([
          fetchProfile(session.user.id),
          fetchFamilyMembers(session.user.id),
        ]);
        setUser({ id: session.user.id, email: session.user.email ?? '', profile });
        setFamilyMembers(members);
      } else {
        setUser(null);
        setFamilyMembers([]);
        setActiveMemberId(null);
      }

      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, fetchFamilyMembers]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value: AppContextValue = {
    user,
    activeMemberId,
    setActiveMemberId,
    familyMembers,
    refreshProfile,
    isDarkMode,
    toggleDarkMode,
    authLoading,
    signOut,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
