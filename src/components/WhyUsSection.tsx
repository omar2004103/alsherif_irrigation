import { motion } from 'framer-motion';
import { Award, Users, Clock, Wrench, Leaf, TrendingUp } from 'lucide-react';

const reasons = [
  { icon: Award, title: 'خبرة طويلة', desc: 'سنوات من الخبرة في مجال الري والتوريدات المائية' },
  { icon: Users, title: 'فريق متخصص', desc: 'مهندسون وفنيون متخصصون في أنظمة الري الحديث' },
  { icon: Clock, title: 'سرعة التوريد', desc: 'نضمن توصيل طلبك في أسرع وقت ممكن' },
  { icon: Wrench, title: 'خدمة ما بعد البيع', desc: 'دعم فني ومتابعة مستمرة بعد التركيب' },
  { icon: Leaf, title: 'حلول بيئية', desc: 'أنظمة ري موفرة للمياه صديقة للبيئة' },
  { icon: TrendingUp, title: 'أسعار تنافسية', desc: 'أفضل الأسعار مع الحفاظ على أعلى جودة' },
];

const WhyUsSection = () => {
  return (
    <section id="why-us" className="py-20 gradient-hero text-primary-foreground">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="mb-3 inline-block rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm font-semibold">لماذا نحن</span>
          <h2 className="text-3xl font-bold sm:text-4xl">لماذا تختار شركة الشريف؟</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/75">نلتزم بتقديم أفضل الحلول والمنتجات لعملائنا</p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur-sm transition-all hover:bg-primary-foreground/10"
            >
              <r.icon className="mb-4 h-8 w-8 text-gold" />
              <h3 className="mb-2 text-lg font-bold">{r.title}</h3>
              <p className="text-sm leading-relaxed text-primary-foreground/75">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
