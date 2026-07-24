import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const LatestArticlesSection = () => {
  const { data: posts } = useQuery({
    queryKey: ['home_blog_posts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-muted/40">
      <div className="container">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="section-label">المدونة</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
              آخر المقالات والنصائح
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              مقالات هندسية وإرشادات عملية من فريقنا لمساعدتك على اتخاذ القرار الأمثل لمشروعك.
            </p>
          </div>
          <Link to="/blog" className="group hidden md:inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all">
            كل المقالات <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post: any, i: number) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-accent">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full gradient-hero" />
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <h3 className="mb-3 text-lg font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mb-5 text-sm text-muted-foreground line-clamp-3 leading-relaxed">{post.excerpt}</p>
                )}
                <Link
                  to={`/blog/${post.slug}`}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-primary group-hover:gap-2 transition-all"
                >
                  اقرأ المقال <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestArticlesSection;