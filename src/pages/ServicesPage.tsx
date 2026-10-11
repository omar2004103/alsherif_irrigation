import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import { useServicesData } from '@/hooks/useServicesData';
import { SERVICE_ICONS } from '@/data/servicesData';

const ServicesPage = () => {
  const { services } = useServicesData();

  return (
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
            {services.map((s, i) => {
              const Icon = SERVICE_ICONS[s.iconName];
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all overflow-hidden"
                >
                  {/* Optional Service Image: rendered only when present, with no blank container or placeholder when absent */}
                  {s.image_url && (
                    <div className="relative -mx-6 -mt-6 mb-5 aspect-[16/10] overflow-hidden bg-muted border-b border-border/60">
                      <img
                        src={s.image_url}
                        alt={s.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).parentElement?.classList.add('hidden');
                        }}
                      />
                    </div>
                  )}

                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent text-primary-foreground">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.desc}</p>
                </motion.div>
              );
            })}
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
};

export default ServicesPage;