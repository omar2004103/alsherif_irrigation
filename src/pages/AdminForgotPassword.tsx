import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      setSent(true);
      toast({ title: 'تم الإرسال ✅', description: 'تفقّد بريدك الإلكتروني' });
    }
  };

  return (
    <div dir="rtl" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[hsl(var(--sherif-blue-deep))] via-[hsl(var(--sherif-blue))] to-[hsl(var(--leaf-dark))] p-4">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <Link to="/admin/login" className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> العودة لتسجيل الدخول
        </Link>
        <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-black text-white">نسيت كلمة المرور؟</h1>
            <p className="mt-1 text-xs text-white/70">أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين</p>
          </div>

          {sent ? (
            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-5 text-center text-white">
              <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-300" />
              <p className="text-sm font-bold">تم إرسال رابط إعادة التعيين</p>
              <p className="mt-1 text-xs text-white/70">افتح البريد واضغط الرابط لتعيين كلمة مرور جديدة.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-white/90">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required dir="ltr"
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pr-10 pl-4 text-sm text-white placeholder-white/40 backdrop-blur-sm outline-none focus:border-white/50 focus:bg-white/15"
                    placeholder="admin@example.com" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-white py-3.5 text-sm font-black text-[hsl(var(--sherif-blue-deep))] shadow-lg transition-all hover:scale-[1.02] disabled:opacity-60">
                {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminForgotPassword;