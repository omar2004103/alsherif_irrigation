import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useSupabaseData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';

const BlogPage = () => {
  const { data: posts, isLoading } = useBlogPosts();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <div className="container py-10">
          <div className="mb-8 flex items-center gap-3 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ArrowRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">المدونة</span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">المدونة</h1>
          <p className="text-muted-foreground mb-8">مقالات ونصائح عن الري الحديث والزراعة</p>

          {isLoading ? <p className="text-center py-12 text-muted-foreground">جاري التحميل...</p> : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts?.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/blog/${post.slug}`} className="block rounded-2xl border border-border bg-card overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all">
                    {post.image_url && <img src={post.image_url} alt={post.title} className="h-48 w-full object-cover" />}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(post.created_at).toLocaleDateString('ar-EG')}</span>
                        <span>•</span>
                        <span>{post.author_name}</span>
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-foreground">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          {!isLoading && (!posts || posts.length === 0) && <p className="text-center py-12 text-muted-foreground">لا توجد مقالات حالياً</p>}
        </div>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default BlogPage;
