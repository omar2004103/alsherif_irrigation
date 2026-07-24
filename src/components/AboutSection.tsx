import { motion } from 'framer-motion';
import { Shield, Headphones, Truck, BadgeDollarSign } from 'lucide-react';

const badges = [
  { icon: Shield, title: 'جودة معتمدة', desc: 'منتجات أصلية بمعايير عالمية' },
  { icon: Headphones, title: 'دعم فني', desc: 'فريق متخصص لخدمتك على مدار الساعة' },
  { icon: Truck, title: 'سرعة توريد', desc: 'توصيل سريع لجميع المحافظات' },
  { icon: BadgeDollarSign, title: 'أسعار تنافسية', desc: 'أفضل الأسعار مع ضمان الجودة' },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="mb-3 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">من نحن</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">شركة الشريف للري الحديث</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            نحن شركة متخصصة في توريد وتركيب أنظمة الري الحديث ومستلزمات المياه. نقدم حلولاً متكاملة للمزارعين والمشاريع الزراعية بأعلى جودة وأفضل الأسعار. خبرتنا الطويلة في السوق المصري تجعلنا الخيار الأمثل لتلبية احتياجاتكم من معدات الري والتوريدات المائية.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-2xl border border-border bg-card p-6 text-center shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:gradient-accent group-hover:text-primary-foreground">
                <badge.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">{badge.title}</h3>
              <p className="text-sm text-muted-foreground">{badge.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
