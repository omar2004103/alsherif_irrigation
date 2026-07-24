import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Phone, Mail, Shield, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminUsers = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const { data: profiles, isLoading, refetch } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: allRoles } = useQuery({
    queryKey: ['admin-all-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const getRoles = (userId: string) => {
    return allRoles?.filter(r => r.user_id === userId).map(r => r.role) ?? [];
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive/10 text-destructive';
      case 'staff': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'أدمن';
      case 'staff': return 'موظف';
      default: return 'عميل';
    }
  };

  const filtered = profiles?.filter(p =>
    p.full_name.includes(search) || p.phone.includes(search)
  ) ?? [];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            إدارة العملاء والمستخدمين
          </h1>
          <p className="text-sm text-muted-foreground mt-1">عرض جميع الحسابات المسجلة في الموقع</p>
        </div>
        <div className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
          {profiles?.length ?? 0} مستخدم
        </div>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="بحث بالاسم أو رقم الهاتف..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-input bg-background py-3 pr-10 pl-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا يوجد مستخدمين</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(profile => {
            const roles = getRoles(profile.id);
            return (
              <div key={profile.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground">{profile.full_name || 'بدون اسم'}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    {profile.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />{profile.phone}
                      </span>
                    )}
                    <span className="text-xs">{new Date(profile.created_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {roles.map(role => (
                    <span key={role} className={`rounded-full px-3 py-1 text-xs font-bold ${getRoleBadge(role)}`}>
                      {getRoleLabel(role)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
