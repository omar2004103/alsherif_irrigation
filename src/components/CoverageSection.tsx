import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const areas = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية', 'البحيرة', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'الوادي الجديد'];

const CoverageSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="mb-3 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">مناطق التغطية</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">نصل إليك أينما كنت</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">نغطي جميع محافظات مصر بخدمة توصيل سريعة</p>
        </motion.div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {areas.map((area, i) => (
            <motion.span
              key={area}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-card"
            >
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {area}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoverageSection;
