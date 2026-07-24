import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Settings, Truck, Headphones, Wrench, Droplets, ClipboardCheck, Cog, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';

const services = [
  { icon: ClipboardCheck, title: 'الاستشارات الهندسية', desc: 'دراسة التربة والمحصول والمناخ لتصميم نظام الري الأمثل لمشروعك.' },
  { icon: Cog, title: 'تصميم أنظمة الري', desc: 'تصميم مخططات هندسية دقيقة لشبكات الري بالتنقيط والرش والمحوري.' },
  { icon: Truck, title: 'التوريد', desc: 'توريد جميع مستلزمات الري من أفضل الماركات العالمية والمحلية.' },
  { icon: Wrench, title: 'التركيب', desc: 'تركيب احترافي على يد فنيين متخصصين مع ضمان شامل على الأعمال.' },
  { icon: Droplets, title: 'ترشيد المياه', desc: 'حلول متقدمة لترشيد استهلاك المياه وزيادة كفاءة الري.' },
  { icon: Zap, title: 'الأتمتة والتحكم', desc: 'أنظمة تحكم ذكية وأتمتة كاملة للتشغيل عن بُعد.' },
  { icon: Settings, title: 'الصيانة الدورية', desc: 'برامج صيانة دورية لضمان استمرارية عمل الشبكة بأعلى كفاءة.' },
  { icon: Headphones, title: 'الدعم الفني', desc: 'فريق دعم متاح للرد على استفساراتك وحل المشكلات فورًا.' },
];

const ServicesPage = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>خدماتنا — آل شريف لنظم الري الحديث</title>
      <meta name="description" content="استشارات، تصميم، توريد، تركيب، أتمتة، وصيانة أنظمة الري الحديث للمشاريع الزراعية." />
      <link rel="canonical" href="https://alsherif-irrigation.lovable.app/services" />
    </Helmet>
    <Navbar />
    <main className="pt-28">
      <section className="relative overflow-hidden bg-[hsl(var(--sherif-blue-deep))] py-20 text-primary-foreground">
        <div className="absolute inset-0 blueprint-grid opacity-[0.06]" />
        <div className="container relative">
          <p className="mb-3 text-xs font-bold tracking-[0.3em] text-primary-foreground/60">02 / SERVICES</p>
          <h1 className="max-w-3xl text-4xl font-extrabold sm:text-5xl">خدماتنا الهندسية</h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/75 leading-relaxed">
            حزمة خدمات متكاملة من الاستشارة حتى الصيانة، لضمان نجاح مشروعك الزراعي.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent text-primary-foreground"><s.icon className="h-7 w-7" /></div>
              <h3 className="mb-2 text-lg font-bold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-14">
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-primary/60">PROCESS</p>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">كيف نعمل معك</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { n: '01', t: 'الاستشارة', d: 'نستمع لاحتياجاتك ونقيّم مشروعك.' },
              { n: '02', t: 'التصميم', d: 'نصمم الحل الأنسب مع دراسة كاملة.' },
              { n: '03', t: 'التنفيذ', d: 'توريد وتركيب بأعلى معايير الجودة.' },
              { n: '04', t: 'المتابعة', d: 'صيانة ودعم فني على المدى الطويل.' },
            ].map((step, i) => (
              <motion.div key={step.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <p className="text-3xl font-extrabold text-primary/20">{step.n}</p>
                <h3 className="mt-2 text-lg font-bold text-foreground">{step.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container rounded-3xl bg-[hsl(var(--sherif-blue-deep))] p-10 text-center text-primary-foreground sm:p-14">
          <h2 className="text-3xl font-bold sm:text-4xl">ابدأ مشروعك اليوم</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/75">فريقنا الهندسي جاهز لتحويل فكرتك إلى مشروع ناجح.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/quote" className="rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground shadow-button">طلب عرض سعر</Link>
            <Link to="/contact" className="rounded-xl border border-primary-foreground/25 bg-primary-foreground/5 px-6 py-3 text-sm font-bold text-primary-foreground">تواصل معنا</Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    <FloatingActions />
  </div>
);

export default ServicesPage;