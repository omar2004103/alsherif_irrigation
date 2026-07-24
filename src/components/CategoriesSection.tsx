import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useSupabaseData';
import { Link } from 'react-router-dom';

const CategoriesSection = () => {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) return <section id="categories" className="py-20 bg-background"><div className="container text-center text-muted-foreground">جاري التحميل...</div></section>;

  return (
    <section id="categories" className="py-20 bg-background">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="mb-3 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">أقسامنا</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">تصنيفات المنتجات</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">نغطي جميع احتياجات الري والتوريدات المائية</p>
        </motion.div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories?.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/category/${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/30"
              >
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
