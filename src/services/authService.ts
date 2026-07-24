import { supabase } from '@/integrations/supabase/client';

export interface AdminProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
  status: string;
}

/**
 * Server-side login using Supabase Auth.
 * Password verification, authentication, session creation, and HttpOnly cookies
 * are handled server-side by Supabase Auth infrastructure.
 */
export async function loginAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message || 'بيانات الدخول غير صحيحة');
  }

  // Fetch admin profile from admin_users table
  const { data: profile } = await supabase
    .from('admin_users')
    .select('*, role:roles(*)')
    .eq('email', email)
    .single();

  // Record last login timestamp
  if (profile?.id) {
    await supabase
      .from('admin_users')
      .update({ lastLogin: new Date().toISOString() })
      .eq('id', profile.id);
  }

  return {
    user: data.user,
    session: data.session,
    profile,
  };
}

/**
 * Log out current admin
 */
export async function logoutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Sign out error:', error.message);
}

/**
 * Get currently authenticated admin user session
 */
export async function getCurrentAdmin() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session) {
    return null;
  }

  const user = sessionData.session.user;
  const { data: profile } = await supabase
    .from('admin_users')
    .select('*, role:roles(*)')
    .eq('email', user.email)
    .single();

  return {
    user,
    session: sessionData.session,
    profile,
  };
}
