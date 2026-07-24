import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Target, Eye, Award, Users, Leaf, Wrench, Shield, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import { Link } from 'react-router-dom';

const values = [
  { icon: Shield, title: 'الجودة', desc: 'منتجات أصلية بمعايير عالمية معتمدة' },
  { icon: Award, title: 'الخبرة', desc: 'سنوات طويلة من الخبرة الهندسية المتخصصة' },
  { icon: Users, title: 'العميل أولاً', desc: 'رضا العميل هو محور عملنا اليومي' },
  { icon: Leaf, title: 'الاستدامة', desc: 'حلول ري صديقة للبيئة وموفرة للمياه' },
  { icon: Wrench, title: 'الاحترافية', desc: 'فريق فني مؤهل ودعم على أعلى مستوى' },
  { icon: TrendingUp, title: 'التطوير', desc: 'مواكبة أحدث تقنيات الري في العالم' },
];

const AboutPage = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>من نحن — آل شريف لنظم الري الحديث</title>
      <meta name="description" content="تعرف على شركة آل شريف لنظم الري الحديث، خبرتنا في تصميم وتوريد وتركيب أنظمة الري للمشاريع الزراعية." />
      <link rel="canonical" href="https://alsherif-irrigation.lovable.app/about" />
    </Helmet>
    <Navbar />
    <main className="pt-28">
      <section className="relative overflow-hidden bg-[hsl(var(--sherif-blue-deep))] py-20 text-primary-foreground">
        <div className="absolute inset-0 blueprint-grid opacity-[0.06]" />
        <div className="container relative">
          <p className="mb-3 text-xs font-bold tracking-[0.3em] text-primary-foreground/60">01 / ABOUT</p>
          <h1 className="max-w-3xl text-4xl font-extrabold sm:text-5xl">من نحن</h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/75 leading-relaxed">
            آل شريف لنظم الري الحديث — شركة هندسية متخصصة في تصميم وتوريد وتركيب أنظمة الري ومستلزمات المياه للمشاريع الزراعية الكبرى والصغيرة.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container grid gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary"><Target className="h-6 w-6" /></div>
            <h2 className="mb-3 text-2xl font-bold text-foreground">رسالتنا</h2>
            <p className="text-muted-foreground leading-relaxed">
              تقديم حلول ري حديثة ومتكاملة للمزارعين والمشاريع الزراعية بأعلى معايير الجودة والكفاءة، مع دعم فني مستمر يضمن نجاح مشاريعهم واستدامتها.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary"><Eye className="h-6 w-6" /></div>
            <h2 className="mb-3 text-2xl font-bold text-foreground">رؤيتنا</h2>
            <p className="text-muted-foreground leading-relaxed">
              أن نكون الشريك الأول الموثوق لكل مشروع زراعي في مصر والمنطقة، ونساهم في تطوير قطاع الزراعة عبر أحدث أنظمة الري وتقنيات ترشيد المياه.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-14">
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-primary/60">02 / VALUES</p>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">قيمنا</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover transition-all">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary"><v.icon className="h-6 w-6" /></div>
                <h3 className="mb-2 text-lg font-bold text-foreground">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container rounded-3xl bg-[hsl(var(--sherif-blue-deep))] p-10 text-center text-primary-foreground sm:p-14">
          <h2 className="text-3xl font-bold sm:text-4xl">هل لديك مشروع؟ نحن جاهزون لمساعدتك</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/75">احصل على استشارة فنية مجانية وعرض سعر مخصص لمشروعك.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/quote" className="rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground shadow-button hover:-translate-y-0.5 transition-transform">طلب عرض سعر</Link>
            <Link to="/contact" className="rounded-xl border border-primary-foreground/25 bg-primary-foreground/5 px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-foreground/10 transition-colors">تواصل معنا</Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    <FloatingActions />
  </div>
);

export default AboutPage;