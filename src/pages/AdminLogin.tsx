import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'خطأ', description: 'يرجى إدخال البريد وكلمة المرور', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      const msg =
        error.message?.toLowerCase().includes('invalid') ? 'البريد أو كلمة المرور غير صحيحة'
        : error.message?.toLowerCase().includes('not confirmed') ? 'البريد الإلكتروني لم يتم تفعيله بعد'
        : error.message?.toLowerCase().includes('rate') ? 'محاولات كثيرة، انتظر قليلاً ثم حاول مرة أخرى'
        : error.message || 'حدث خطأ غير متوقع';
      toast({ title: 'فشل تسجيل الدخول', description: msg, variant: 'destructive' });
    } else {
      toast({ title: 'أهلاً بك 👋', description: 'تم تسجيل الدخول بنجاح' });
      navigate('/admin/dashboard');
    }
    setLoading(false);
  };

  return (
    <div dir="rtl" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[hsl(var(--sherif-blue-deep))] via-[hsl(var(--sherif-blue))] to-[hsl(var(--leaf-dark))] p-4">
      {/* Blueprint grid */}
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[hsl(var(--leaf))] opacity-20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[hsl(var(--water))] opacity-20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/70 transition-colors hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> العودة إلى الموقع
        </Link>

        <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg">
              <img src="/logo.png" alt="آل شريف" className="h-16 w-16 rounded-xl object-contain" />
            </div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              <ShieldCheck className="h-3 w-3" /> Admin Portal
            </div>
            <h1 className="text-2xl font-black text-white">لوحة تحكم الإدارة</h1>
            <p className="mt-1 text-xs text-white/70">آل شريف لنظم الري الحديث</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-white/90">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pr-10 pl-4 text-sm text-white placeholder-white/40 backdrop-blur-sm outline-none transition-all focus:border-white/50 focus:bg-white/15"
                  placeholder="admin@example.com"
                  dir="ltr"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-white/90">كلمة المرور</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pr-10 pl-10 text-sm text-white placeholder-white/40 backdrop-blur-sm outline-none transition-all focus:border-white/50 focus:bg-white/15"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/admin/forgot-password" className="text-xs font-medium text-white/80 hover:text-white hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white py-3.5 text-sm font-black text-[hsl(var(--sherif-blue-deep))] shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-60"
            >
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول إلى اللوحة'}
            </button>
          </form>

          <div className="mt-6 border-t border-white/15 pt-4 text-center">
            <p className="text-[11px] text-white/60">
              الوصول مخصص لفريق الإدارة فقط. جميع محاولات الدخول مسجّلة.
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-white/50">
          © آل شريف لنظم الري الحديث · +25 سنة من الخبرة
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
