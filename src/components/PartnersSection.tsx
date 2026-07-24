import { motion } from 'framer-motion';

const partners = ['🏭 مصانع المواسير', '⚙️ طلمبات إيطالية', '🇩🇪 تقنيات ألمانية', '🇪🇬 إنتاج مصري', '🌍 ماركات عالمية', '🔧 قطع غيار أصلية'];

const PartnersSection = () => {
  return (
    <section className="py-12 border-y border-border bg-card">
      <div className="container">
        <p className="text-center text-sm font-semibold text-muted-foreground mb-6">شركاؤنا وعلاماتنا التجارية</p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {partners.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-background px-6 py-3 text-sm font-medium text-muted-foreground"
            >
              {p}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
