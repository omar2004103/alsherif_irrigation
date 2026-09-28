import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Calendar, User, Clock, Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
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

  const hasHtml = post?.content ? /<[a-z][\s\S]*>/i.test(post.content) : false;
  const pageTitle = (post as any)?.meta_title || post?.title || 'المقال';
  const pageDescription = (post as any)?.meta_description || post?.excerpt || 'مقالات ونصائح عن شبكات الري الحديث والزراعة من شركة آل شريف.';

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {post && (
        <Helmet>
          <title>{pageTitle} — آل شريف لنظم الري الحديث</title>
          <meta name="description" content={pageDescription} />
          <link rel="canonical" href={`https://alsherif-irrigation.com/blog/${post.slug}`} />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          {post.image_url && <meta property="og:image" content={post.image_url} />}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDescription} />
          {post.image_url && <meta name="twitter:image" content={post.image_url} />}
        </Helmet>
      )}

      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl py-6">
          
          {/* Breadcrumb Navigation */}
          <nav className="mb-8 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ArrowRight className="h-3 w-3 rotate-180" />
            <Link to="/blog" className="hover:text-primary transition-colors">المدونة</Link>
            <ArrowRight className="h-3 w-3 rotate-180" />
            <span className="text-foreground font-semibold line-clamp-1">{post?.title || 'المقال'}</span>
          </nav>

          {isLoading ? (
            <div className="space-y-4 py-12 animate-pulse">
              <div className="h-8 bg-muted rounded-xl w-3/4" />
              <div className="h-4 bg-muted rounded-lg w-1/3" />
              <div className="h-72 bg-muted rounded-2xl w-full" />
              <div className="space-y-2 pt-4">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/6" />
              </div>
            </div>
          ) : post ? (
            <article className="space-y-6">
              {/* Header Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary font-bold">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(post.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{post.author_name || 'فريق آل شريف'}</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground leading-tight">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed border-r-4 border-primary/60 pr-4 py-1 bg-accent/20 rounded-l-xl">
                    {post.excerpt}
                  </p>
                )}
              </div>

              {/* Featured Image */}
              {post.image_url && (
                <div className="relative overflow-hidden rounded-3xl border border-border shadow-card bg-muted/20 my-6">
                  <img
                    src={post.image_url}
                    alt={(post as any)?.alt_text || post.title}
                    className="w-full max-h-[460px] object-cover object-center"
                    loading="lazy"
                  />
                  {(post as any)?.alt_text && (
                    <div className="bg-card/90 backdrop-blur-sm px-4 py-2 text-xs text-muted-foreground text-center border-t border-border/50">
                      {(post as any).alt_text}
                    </div>
                  )}
                </div>
              )}

              {/* Post Content */}
              <div className="prose prose-slate dark:prose-invert prose-emerald lg:prose-lg max-w-none text-right dir-rtl leading-relaxed pt-2">
                {hasHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                  <div className="whitespace-pre-line text-foreground">
                    {post.content}
                  </div>
                )}
              </div>

              {/* Post Bottom CTA Card */}
              <div className="mt-12 rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-card to-emerald-500/5 p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">هل تخطط لمشروع ري أو تحتاج استشارة هندسية؟</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">فريق مهندسي آل شريف يوفر دراسات مجانية وتوريد لكافة مستلزمات الري الحديث بأعلى معايير الجودة.</p>
                </div>
                <Link
                  to="/quote"
                  className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-button hover:opacity-90 transition-opacity"
                >
                  طلب عرض سعر مجاناً
                </Link>
              </div>
            </article>
          ) : (
            <div className="text-center py-20 space-y-4">
              <h2 className="text-2xl font-bold text-foreground">المقال غير موجود</h2>
              <p className="text-muted-foreground">قد يكون تم حذف المقال أو تغيير رابطه الدائم.</p>
              <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
                <ArrowRight className="h-4 w-4 rotate-180" /> العودة لكافة المقالات
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default BlogPostPage;
