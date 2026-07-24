import { motion } from 'framer-motion';
import { Settings, Truck, Headphones } from 'lucide-react';

const services = [
  { icon: Settings, title: 'استشارات فنية', desc: 'نقدم استشارات متخصصة لتصميم أنظمة الري المناسبة لمشروعك الزراعي مع دراسة التربة والمحصول والمناخ.' },
  { icon: Truck, title: 'توريد وتركيب', desc: 'نوفر جميع مستلزمات الري مع خدمة تركيب احترافية على يد فنيين متخصصين وضمان شامل على الأعمال.' },
  { icon: Headphones, title: 'دعم ما بعد البيع', desc: 'فريق دعم فني متاح لمساعدتك في الصيانة وحل المشكلات والتوسعات المستقبلية لشبكة الري.' },
];

const ServicesSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="mb-3 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">خدماتنا</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">خدمات متكاملة</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">نقدم حزمة خدمات شاملة من الاستشارة حتى ما بعد التركيب</p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="rounded-2xl border border-border bg-card p-8 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1 text-center"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent text-primary-foreground">
                <s.icon className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
