import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTestimonials } from '@/hooks/useSupabaseData';

const TestimonialsSection = () => {
  const { data: testimonials } = useTestimonials();

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="mb-3 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">آراء العملاء</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">ماذا يقول عملاؤنا</h2>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials?.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-gold text-gold" />)}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">"{t.content}"</p>
              <div>
                <p className="text-sm font-bold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
