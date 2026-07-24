import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const applyRoles = async (userId: string | null) => {
      if (!userId) {
        if (!mounted) return;
        setRoles([]); setIsAdmin(false); setIsStaff(false);
        return;
      }
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      if (!mounted) return;
      const list = rolesData?.map(r => r.role as string) ?? [];
      setRoles(list);
      setIsAdmin(list.includes('admin'));
      setIsStaff(list.includes('staff'));
    };

    // 1. Register listener FIRST (defer async DB calls to avoid deadlock).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setTimeout(() => { applyRoles(session?.user?.id ?? null); }, 0);
    });

    // 2. Then hydrate initial session.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      await applyRoles(session?.user?.id ?? null);
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, string>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata, emailRedirectTo: `${window.location.origin}/admin/login` }
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRoles([]);
    setIsAdmin(false);
    setIsStaff(false);
  };

  return { user, loading, isAdmin, isStaff, roles, signIn, signUp, signOut };
};
