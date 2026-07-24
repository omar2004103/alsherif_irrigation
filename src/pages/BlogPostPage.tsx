import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';

const BlogPostPage = () => {
  const { slug } = useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ['blog_post', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <div className="container max-w-3xl py-10">
          <div className="mb-8 flex items-center gap-3 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ArrowRight className="h-3 w-3" />
            <Link to="/blog" className="hover:text-primary transition-colors">المدونة</Link>
            <ArrowRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">{post?.title}</span>
          </div>

          {isLoading ? <p className="text-center py-12 text-muted-foreground">جاري التحميل...</p> : post && (
            <article>
              {post.image_url && <img src={post.image_url} alt={post.title} className="w-full h-64 object-cover rounded-2xl mb-6" />}
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.created_at).toLocaleDateString('ar-EG')}</span>
                <span>•</span>
                <span>{post.author_name}</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-6">{post.title}</h1>
              <div className="prose prose-lg max-w-none text-foreground leading-relaxed whitespace-pre-line">{post.content}</div>
            </article>
          )}
        </div>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default BlogPostPage;
