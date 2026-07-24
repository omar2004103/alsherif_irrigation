import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast({ title: 'كلمة المرور قصيرة', description: '6 أحرف على الأقل', variant: 'destructive' });
    if (password !== confirm) return toast({ title: 'غير متطابقة', description: 'كلمتا المرور غير متطابقتين', variant: 'destructive' });
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    toast({ title: 'تم التحديث ✅', description: 'كلمة المرور الجديدة جاهزة' });
    navigate('/admin/login');
  };

  return (
    <div dir="rtl" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[hsl(var(--sherif-blue-deep))] via-[hsl(var(--sherif-blue))] to-[hsl(var(--leaf-dark))] p-4">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-black text-white">تعيين كلمة مرور جديدة</h1>
            <p className="mt-1 text-xs text-white/70">أدخل كلمة مرور قوية لحماية حسابك</p>
          </div>

          {!ready ? (
            <p className="text-center text-sm text-white/80">جاري التحقق من الرابط...</p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-white/90">كلمة المرور الجديدة</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                  <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pr-10 pl-10 text-sm text-white placeholder-white/40 backdrop-blur-sm outline-none focus:border-white/50" placeholder="••••••••" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-white/90">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                  <input type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6}
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pr-10 pl-10 text-sm text-white placeholder-white/40 backdrop-blur-sm outline-none focus:border-white/50" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-white py-3.5 text-sm font-black text-[hsl(var(--sherif-blue-deep))] shadow-lg transition-all hover:scale-[1.02] disabled:opacity-60">
                {loading ? 'جاري الحفظ...' : 'تحديث كلمة المرور'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;