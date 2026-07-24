import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Award, Package, Users, Building2 } from 'lucide-react';

const stats = [
  { icon: Award, value: 25, suffix: '+', label: 'سنة من الخبرة', hint: 'في هندسة الري' },
  { icon: Package, value: 320, suffix: '+', label: 'منتج', hint: 'من ماركات عالمية' },
  { icon: Users, value: 2400, suffix: '+', label: 'عميل', hint: 'يثقون بنا' },
  { icon: Building2, value: 500, suffix: '+', label: 'مشروع منفذ', hint: 'داخل مصر' },
];

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1400, bounce: 0 });

  useEffect(() => {
    if (inView) mv.set(to);
    const unsub = spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.floor(v).toLocaleString('en-US');
    });
    return unsub;
  }, [inView, to, mv, spring]);

  return <span ref={ref}>0</span>;
}

const StatsSection = () => {
  return (
    <section className="relative -mt-16 z-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-border bg-card shadow-card-hover overflow-hidden"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-border sm:divide-x sm:divide-x-reverse">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="group relative p-8 lg:p-10 transition-colors hover:bg-accent/40"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <s.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-4xl lg:text-5xl font-extrabold text-primary tabular-nums">
                    <Counter to={s.value} />
                  </span>
                  <span className="font-heading text-3xl font-bold text-secondary">{s.suffix}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;