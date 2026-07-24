import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { useTips } from '@/hooks/useSupabaseData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';

const TipsPage = () => {
  const { data: tips, isLoading } = useTips();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <div className="container py-10">
          <div className="mb-8 flex items-center gap-3 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ArrowRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">نصائح وإرشادات</span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">نصائح وإرشادات الري</h1>
          <p className="text-muted-foreground mb-8">نصائح فنية وإرشادات عملية لصيانة واستخدام أنظمة الري</p>

          {isLoading ? <p className="text-center py-12 text-muted-foreground">جاري التحميل...</p> : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tips?.map((tip, i) => (
                <motion.div key={tip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{tip.category}</span>
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-foreground">{tip.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{tip.content}</p>
                </motion.div>
              ))}
            </div>
          )}
          {!isLoading && (!tips || tips.length === 0) && <p className="text-center py-12 text-muted-foreground">لا توجد نصائح حالياً</p>}
        </div>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default TipsPage;
