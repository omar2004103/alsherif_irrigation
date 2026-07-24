import { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Package, FileText, Lightbulb } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import { useProducts, useBlogPosts, useTips } from '@/hooks/useSupabaseData';

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') || '';
  const [q, setQ] = useState(initial);
  const { data: products } = useProducts();
  const { data: posts } = useBlogPosts();
  const { data: tips } = useTips();

  useEffect(() => { setQ(initial); }, [initial]);

  const term = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!term) return { products: [], posts: [], tips: [] };
    const match = (v?: string | null) => (v || '').toLowerCase().includes(term);
    return {
      products: (products || []).filter((p: any) => match(p.title) || match(p.description) || match(p.brand) || match(p.product_code)).slice(0, 12),
      posts: (posts || []).filter((p: any) => match(p.title) || match(p.excerpt) || match(p.content)).slice(0, 8),
      tips: (tips || []).filter((t: any) => match(t.title) || match(t.content)).slice(0, 8),
    };
  }, [term, products, posts, tips]);

  const total = results.products.length + results.posts.length + results.tips.length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(q.trim() ? { q: q.trim() } : {});
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{term ? `نتائج البحث: ${term}` : 'البحث'} — آل شريف</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />
      <main className="pt-28">
        <section className="bg-[hsl(var(--sherif-blue-deep))] py-16 text-primary-foreground">
          <div className="container">
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-primary-foreground/60">SEARCH</p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">البحث في الموقع</h1>
            <form onSubmit={submit} className="mt-6 flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-card">
              <SearchIcon className="mr-2 h-5 w-5 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن منتج، مقال، أو نصيحة..."
                className="flex-1 bg-transparent py-2 text-sm text-foreground focus:outline-none" autoFocus />
              <button type="submit" className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">بحث</button>
            </form>
            {term && <p className="mt-4 text-sm text-primary-foreground/70">{total} نتيجة عن "{term}"</p>}
          </div>
        </section>

        <section className="py-16">
          <div className="container space-y-12">
            {!term && (
              <p className="text-center text-muted-foreground">اكتب في مربع البحث للبدء.</p>
            )}
            {term && total === 0 && (
              <p className="text-center text-muted-foreground">لا توجد نتائج مطابقة. جرّب كلمات أخرى.</p>
            )}

            {results.products.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground"><Package className="h-5 w-5 text-primary" />المنتجات ({results.products.length})</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.products.map((p: any) => (
                    <Link key={p.id} to={`/product/${p.slug}`} className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                      <h3 className="font-bold text-foreground">{p.title}</h3>
                      {p.brand && <p className="mt-1 text-xs text-muted-foreground">{p.brand}</p>}
                      {p.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.posts.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground"><FileText className="h-5 w-5 text-primary" />المقالات ({results.posts.length})</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {results.posts.map((p: any) => (
                    <Link key={p.id} to={`/blog/${p.slug}`} className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                      <h3 className="font-bold text-foreground">{p.title}</h3>
                      {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.tips.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground"><Lightbulb className="h-5 w-5 text-primary" />النصائح ({results.tips.length})</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {results.tips.map((t: any) => (
                    <Link key={t.id} to="/tips" className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                      <h3 className="font-bold text-foreground">{t.title}</h3>
                      {t.content && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{t.content}</p>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default SearchPage;