import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Clock, KeyRound, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AdminProfile = () => {
  const { user, roles } = useAuth() as any;
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle().then(({ data }) => {
      if (data) { setFullName(data.full_name || ''); setPhone(data.phone || ''); }
    });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id);
    setSaving(false);
    if (error) toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    else toast({ title: 'تم الحفظ ✅', description: 'تم تحديث بياناتك الشخصية' });
  };

  const changePassword = async () => {
    if (password.length < 6) return toast({ title: 'كلمة مرور قصيرة', variant: 'destructive' });
    if (password !== confirm) return toast({ title: 'غير متطابقة', variant: 'destructive' });
    setChangingPass(true);
    const { error } = await supabase.auth.updateUser({ password });
    setChangingPass(false);
    if (error) toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    else { toast({ title: 'تم التحديث ✅' }); setPassword(''); setConfirm(''); }
  };

  const lastSignIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ar-EG') : '—';
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG') : '—';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ملفي الشخصي</h1>
        <p className="text-sm text-muted-foreground mt-1">إدارة بياناتك الشخصية وكلمة المرور</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-4 pb-5 border-b border-border">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <User className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-foreground truncate">{fullName || user?.email}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1"><Mail className="h-3 w-3" /><span dir="ltr">{user?.email}</span></div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
            <Shield className="h-3 w-3" />{(roles || []).join(' · ') || 'مستخدم'}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 py-5 border-b border-border text-sm">
          <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /><span>آخر تسجيل دخول: <b className="text-foreground" dir="ltr">{lastSignIn}</b></span></div>
          <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /><span>تاريخ الإنشاء: <b className="text-foreground">{createdAt}</b></span></div>
        </div>

        <div className="space-y-4 pt-5">
          <h3 className="text-sm font-bold text-foreground">البيانات الشخصية</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted-foreground">الاسم الكامل</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full rounded-xl border border-input bg-background py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted-foreground">رقم الهاتف</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" className="w-full rounded-xl border border-input bg-background py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-button transition-all hover:scale-[1.02] disabled:opacity-60">
            <Save className="h-4 w-4" />{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold"><KeyRound className="h-5 w-5" /></div>
          <div>
            <h3 className="text-sm font-bold text-foreground">تغيير كلمة المرور</h3>
            <p className="text-xs text-muted-foreground">استخدم كلمة مرور قوية لحماية حسابك</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">كلمة المرور الجديدة</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-input bg-background py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="••••••••" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">تأكيد كلمة المرور</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full rounded-xl border border-input bg-background py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="••••••••" />
          </div>
        </div>
        <button onClick={changePassword} disabled={changingPass || !password} className="mt-4 flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-bold text-background transition-all hover:scale-[1.02] disabled:opacity-60">
          <KeyRound className="h-4 w-4" />{changingPass ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
        </button>
      </motion.div>
    </div>
  );
};

export default AdminProfile;