import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, MessageCircle, Phone, FileText, Download, Share2, Printer,
  Copy, Package, Plus, Minus, ShieldCheck, Truck, Award, Sparkles, Mail, Clock,
  ChevronRight, X as CloseIcon, ZoomIn
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import { useProductBySlug, useProductImages, useProducts, useCategories, useProductsByIds } from '@/hooks/useSupabaseData';
import { useQuoteCart } from '@/hooks/useQuoteCart';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const AVAIL: Record<string, string> = {
  available: 'متوفر',
  on_request: 'متوفر عند الطلب',
  contact_us: 'تواصل معنا للتفاصيل',
  out_of_stock: 'غير متوفر حالياً',
};

const productFAQ = [
  { q: 'هل يشمل السعر التركيب؟', a: 'أسعار المنتجات لا تشمل التركيب افتراضياً. نقدم خدمة تركيب احترافية بأسعار تنافسية — يُرجى طلب عرض سعر متكامل للمنتج + التركيب.' },
  { q: 'ما هي مدة الضمان؟', a: 'جميع منتجاتنا مدعومة بضمان من الشركة المصنعة، وتختلف مدة الضمان حسب المنتج والماركة. تواصل معنا لمعرفة تفاصيل الضمان لكل منتج.' },
  { q: 'هل تقدمون خدمة التوصيل؟', a: 'نعم، نوصل لجميع محافظات مصر خلال 3-7 أيام عمل. رسوم التوصيل تُحسب حسب الوجهة والكمية.' },
  { q: 'كيف يمكنني الحصول على استشارة فنية؟', a: 'يمكنك التواصل معنا عبر الواتساب أو الاتصال بفريق الدعم الفني، وسيقوم مهندس متخصص بمساعدتك في اختيار المنتج المناسب.' },
];

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIdx, setZoomIdx] = useState(0);

  const openZoom = (i: number) => { setZoomIdx(i); setZoomOpen(true); };

  return (
    <div className="space-y-4">
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-gradient-to-tr from-accent/50 via-card to-accent/30 p-6 cursor-zoom-in shadow-card transition-all duration-500 hover:shadow-card-hover flex items-center justify-center"
        onClick={() => openZoom(active)}
      >
        {images[active] ? (
          <>
            <img src={images[active]} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-25 blur-2xl scale-125" />
            <img
              src={images[active]}
              alt={title}
              className="relative z-10 max-h-full max-w-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/30">
            <Package className="h-24 w-24" strokeWidth={1.2} />
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); openZoom(active); }}
          className="absolute bottom-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 backdrop-blur-md text-primary shadow-hero opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
          aria-label="عرض بحجم كامل"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2.5">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`aspect-square overflow-hidden rounded-xl border-2 p-1 transition-all bg-accent/20 ${
                i === active ? 'border-primary shadow-card ring-2 ring-primary/20 scale-105' : 'border-border opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-contain rounded-lg" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-5xl border-0 bg-transparent p-0 shadow-none">
          <div className="relative">
            <button
              onClick={() => setZoomOpen(false)}
              className="absolute top-3 left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-card"
              aria-label="إغلاق"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setZoomIdx((zoomIdx - 1 + images.length) % images.length)}
                  className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground shadow-card"
                  aria-label="السابق"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setZoomIdx((zoomIdx + 1) % images.length)}
                  className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground shadow-card"
                  aria-label="التالي"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </>
            )}
            <img src={images[zoomIdx]} alt={title} className="max-h-[85vh] w-full rounded-2xl object-contain bg-card" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProductBySlug(slug);
  const { data: allImages } = useProductImages(product?.id ?? '');
  const { data: categories } = useCategories();
  const { data: allProducts } = useProducts();
  const { add: addToQuote } = useQuoteCart();
  const { ids: recentIds, track } = useRecentlyViewed();
  const { data: recentProducts } = useProductsByIds(recentIds.filter((id) => id !== product?.id));

  const [qty, setQty] = useState(1);

  useEffect(() => { if (product?.id) track(product.id); }, [product?.id, track]);

  // Increment view counter once per session per product
  useEffect(() => {
    if (!product?.id) return;
    const key = `viewed_${product.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    (async () => {
      const current = (product as any).view_count || 0;
      await (await import('@/integrations/supabase/client')).supabase
        .from('products').update({ view_count: current + 1 }).eq('id', product.id);
    })();
  }, [product?.id]);

  const category = useMemo(() => categories?.find((c: any) => c.id === product?.category_id), [categories, product]);

  const compatibleIds = (product?.compatible_product_ids || []) as string[];
  const { data: bundleProducts } = useProductsByIds(compatibleIds);

  const related = useMemo(() => {
    if (!allProducts || !product) return [];
    return allProducts
      .filter((p: any) => p.id !== product.id && p.category_id === product.category_id)
      .slice(0, 4);
  }, [allProducts, product]);

  const images = useMemo(() => {
    const list: string[] = [];
    if (product?.image_url) list.push(product.image_url);
    (allImages || []).forEach((img: any) => { if (img.image_url && !list.includes(img.image_url)) list.push(img.image_url); });
    return list;
  }, [product, allImages]);

  const handleAddToQuote = () => {
    if (!product) return;
    addToQuote(
      { id: product.id, title: product.title, slug: product.slug, image: product.image_url, brand: product.brand, product_code: product.product_code },
      qty
    );
    toast.success(`تمت إضافة ${qty} × ${product.title} إلى طلب عرض السعر`, {
      action: { label: 'عرض الطلب', onClick: () => navigate('/quote') },
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product?.title, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    toast.success('تم نسخ رابط المنتج');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-40 pb-20 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-10 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse rounded bg-muted" />
            <div className="h-12 w-40 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-40 pb-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">المنتج غير موجود</h1>
          <Link to="/products" className="mt-6 inline-flex items-center gap-2 text-primary font-bold hover:underline">
            <ChevronLeft className="h-4 w-4" /> العودة للمنتجات
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const specs = (product.specs || []) as Array<{ label: string; value: string; important?: boolean }>;
  const applications = (product.applications || []) as Array<{ label: string; icon?: string }>;
  const features = (product.features || []) as Array<{ title: string; description?: string }>;
  const downloads = (product.downloads || []) as Array<{ label: string; url: string; type?: string }>;
  const sizes = product.sizes || [];

  const canonicalUrl = `https://alsherif-irrigation.lovable.app/product/${product.slug}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{product.meta_title || `${product.title} — آل شريف`}</title>
        <meta name="description" content={product.meta_description || product.description || `${product.title} من آل شريف لنظم الري الحديث`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.description || ''} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="product" />
        {product.image_url && <meta property="og:image" content={product.image_url} />}
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          description: product.description,
          sku: product.product_code || undefined,
          brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
          image: product.image_url || undefined,
          category: category?.name || undefined,
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://alsherif-irrigation.lovable.app/' },
            { '@type': 'ListItem', position: 2, name: 'المنتجات', item: 'https://alsherif-irrigation.lovable.app/products' },
            { '@type': 'ListItem', position: 3, name: product.title, item: canonicalUrl },
          ],
        })}</script>
      </Helmet>

      <Navbar />
      <FloatingActions />

      {/* Breadcrumb */}
      <section className="border-b border-border bg-card pt-28 pb-6">
        <div className="container">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">الرئيسية</Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <Link to="/products" className="hover:text-primary">المنتجات</Link>
            {category && (
              <>
                <ChevronLeft className="h-3.5 w-3.5" />
                <Link to={`/products?cat=${category.id}`} className="hover:text-primary">{category.name}</Link>
              </>
            )}
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground line-clamp-1">{product.title}</span>
          </nav>
        </div>
      </section>

      {/* Main info */}
      <section className="py-12">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr_320px]">
            {/* Gallery */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Gallery images={images} title={product.title} />
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {category && <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">{category.name}</span>}
                <span className="rounded-full bg-[hsl(115,43%,92%)] px-3 py-1 text-xs font-bold text-secondary">
                  {AVAIL[product.availability] || AVAIL.available}
                </span>
                {product.featured && (
                  <span className="rounded-full bg-[hsl(32,95%,44%)] px-3 py-1 text-xs font-bold text-white">مميز</span>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground leading-tight tracking-tight">
                {product.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {product.brand && (
                  <div><span className="text-muted-foreground">الماركة: </span><span className="font-bold text-foreground">{product.brand}</span></div>
                )}
                {product.product_code && (
                  <div><span className="text-muted-foreground">كود المنتج: </span><span className="font-bold text-foreground" dir="ltr">#{product.product_code}</span></div>
                )}
              </div>

              {product.description && (
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">{product.description}</p>
              )}

              {sizes.length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-sm font-bold text-foreground">المقاسات المتاحة:</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s: string) => (
                      <span key={s} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + Add */}
              <div className="mt-8 flex items-stretch gap-3">
                <div className="inline-flex items-center rounded-xl border border-border bg-card">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="flex h-12 w-12 items-center justify-center text-foreground hover:bg-accent rounded-r-xl"
                    aria-label="تقليل الكمية"
                  ><Minus className="h-4 w-4" /></button>
                  <span className="w-14 text-center text-base font-bold text-foreground tabular-nums">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="flex h-12 w-12 items-center justify-center text-foreground hover:bg-accent rounded-l-xl"
                    aria-label="زيادة الكمية"
                  ><Plus className="h-4 w-4" /></button>
                </div>
                <button
                  onClick={handleAddToQuote}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-button transition-transform hover:-translate-y-0.5"
                >
                  <FileText className="h-4 w-4" /> أضف إلى عرض السعر
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={handleShare} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                  <Share2 className="h-3.5 w-3.5" /> مشاركة
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('تم نسخ الرابط'); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent"
                ><Copy className="h-3.5 w-3.5" /> نسخ الرابط</button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                  <Printer className="h-3.5 w-3.5" /> طباعة
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-border pt-6">
                {[
                  { icon: ShieldCheck, label: 'ضمان أصلي' },
                  { icon: Truck, label: 'توصيل سريع' },
                  { icon: Award, label: 'ماركة معتمدة' },
                ].map((b) => (
                  <div key={b.label} className="text-center">
                    <b.icon className="mx-auto h-5 w-5 text-primary" strokeWidth={1.75} />
                    <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">{b.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Sticky contact card (desktop) */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="sticky top-28 space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">تواصل مباشر</p>
                <h3 className="text-base font-extrabold text-foreground">تحتاج مساعدة؟</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  فريقنا الفني جاهز لمساعدتك في اختيار المنتج المناسب وتقديم عرض سعر مخصص.
                </p>
                <div className="space-y-2 pt-2">
                  <a
                    href={`https://wa.me/201111661177?text=${encodeURIComponent(`استفسار عن: ${product.title}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground shadow-button transition-transform hover:-translate-y-0.5"
                  ><MessageCircle className="h-4 w-4" /> واتساب</a>
                  <a href="tel:01111661177" className="flex items-center gap-3 rounded-xl border border-primary/20 bg-accent px-4 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Phone className="h-4 w-4" /> اتصل الآن
                  </a>
                  <a href="mailto:info@alsherif-irrigation.com" className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-bold text-foreground hover:bg-accent">
                    <Mail className="h-4 w-4" /> راسلنا بالبريد
                  </a>
                </div>
                <div className="mt-2 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> السبت - الخميس · 9ص - 6م
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* Specs / applications / features / downloads */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container grid gap-8 lg:grid-cols-2">
          {/* Specs */}
          <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-card">
            <div className="mb-5 flex items-center gap-2">
              <span className="section-label">المواصفات</span>
            </div>
            <h2 className="mb-6 text-xl font-extrabold text-foreground">المواصفات الفنية</h2>
            {specs.length > 0 ? (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {specs.map((s, i) => (
                    <tr key={i} className={s.important ? 'bg-accent/40' : ''}>
                      <td className="py-3 text-muted-foreground">{s.label}</td>
                      <td className={`py-3 text-left font-bold ${s.important ? 'text-primary' : 'text-foreground'}`}>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-muted-foreground">تواصل معنا للحصول على ورقة المواصفات الكاملة لهذا المنتج.</p>
            )}
          </div>

          {/* Applications */}
          <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-card">
            <div className="mb-5 flex items-center gap-2">
              <span className="section-label">التطبيقات</span>
            </div>
            <h2 className="mb-6 text-xl font-extrabold text-foreground">مناسب لـ</h2>
            {applications.length > 0 ? (
              <ul className="grid grid-cols-2 gap-3">
                {applications.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3 text-sm font-semibold text-foreground">
                    <Sparkles className="h-4 w-4 text-secondary" strokeWidth={1.75} />
                    {a.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">مناسب لمعظم مشاريع الري الحديث. تواصل معنا لتوصية مخصصة لمشروعك.</p>
            )}
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-card lg:col-span-2">
              <div className="mb-5 flex items-center gap-2">
                <span className="section-label">المميزات</span>
              </div>
              <h2 className="mb-6 text-xl font-extrabold text-foreground">لماذا هذا المنتج؟</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((f, i) => (
                  <div key={i} className="rounded-xl border border-border bg-background p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
                      <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <h3 className="mb-1.5 text-sm font-extrabold text-foreground">{f.title}</h3>
                    {f.description && <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Downloads */}
          {downloads.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-card lg:col-span-2">
              <div className="mb-5 flex items-center gap-2">
                <span className="section-label">الملفات</span>
              </div>
              <h2 className="mb-6 text-xl font-extrabold text-foreground">تحميل الملفات الفنية</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {downloads.map((d, i) => (
                  <a
                    key={i}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/40 hover:shadow-card"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground line-clamp-1">{d.label}</p>
                      {d.type && <p className="text-xs text-muted-foreground uppercase">{d.type}</p>}
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Frequently used together */}
      {bundleProducts && bundleProducts.length > 0 && (
        <section className="border-t border-border bg-background py-16">
          <div className="container">
            <div className="mb-8">
              <span className="section-label">تُستخدم معاً</span>
              <h2 className="mt-3 text-2xl font-extrabold text-foreground">منتجات متوافقة يُنصح بشرائها معاً</h2>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-card">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {bundleProducts.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-accent/40">
                      {p.image_url ? <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" /> :
                        <div className="flex h-full items-center justify-center"><Package className="h-6 w-6 text-muted-foreground/40" /></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground line-clamp-2">{p.title}</p>
                      {p.brand && <p className="text-[11px] text-muted-foreground">{p.brand}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  bundleProducts.forEach((p: any) => addToQuote({
                    id: p.id, title: p.title, slug: p.slug, image: p.image_url, brand: p.brand, product_code: p.product_code
                  }));
                  addToQuote({ id: product.id, title: product.title, slug: product.slug, image: product.image_url, brand: product.brand, product_code: product.product_code });
                  toast.success('تمت إضافة الحزمة كاملة إلى عرض السعر');
                }}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-button"
              >
                <Plus className="h-4 w-4" /> أضف الحزمة كاملة إلى عرض السعر
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Technical consultation CTA */}
      <section className="border-t border-border bg-[hsl(var(--sherif-blue-deep))] py-16 text-primary-foreground">
        <div className="absolute inset-x-0 blueprint-grid opacity-[0.06]" style={{ height: 400 }} />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-label !text-primary-foreground/70 before:!bg-primary-foreground/40">استشارة</span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-extrabold tracking-tight">
              تحتاج مساعدة في اختيار المنتج المناسب؟
            </h2>
            <p className="mt-4 text-primary-foreground/80 leading-relaxed">
              فريقنا الهندسي يساعدك في تحليل احتياجات مشروعك واختيار المنتج الأمثل بالمواصفات والأسعار المناسبة.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={handleAddToQuote}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-6 py-3 text-sm font-bold text-primary shadow-hero"
              ><FileText className="h-4 w-4" /> طلب عرض سعر</button>
              <a href={`https://wa.me/201111661177?text=${encodeURIComponent(`أرغب باستشارة فنية بخصوص: ${product.title}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground shadow-button">
                <MessageCircle className="h-4 w-4" /> استشارة عبر واتساب
              </a>
              <a href="tel:01111661177" className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/25 bg-primary-foreground/[0.06] backdrop-blur px-6 py-3 text-sm font-bold text-primary-foreground">
                <Phone className="h-4 w-4" /> اتصل بمهندسنا
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="section-label">منتجات مشابهة</span>
                <h2 className="mt-3 text-2xl font-extrabold text-foreground">قد يعجبك أيضاً</h2>
              </div>
              <Link to="/products" className="text-sm font-bold text-primary hover:underline hidden md:inline">
                كل المنتجات
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p: any) => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-accent/30">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><Package className="h-10 w-10 text-muted-foreground/30" /></div>
                    )}
                  </div>
                  <div className="p-4">
                    {p.brand && <p className="text-[11px] font-semibold text-secondary uppercase">{p.brand}</p>}
                    <h3 className="mt-1 text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently viewed */}
      {recentProducts && recentProducts.length > 0 && (
        <section className="border-t border-border py-16 bg-muted/30">
          <div className="container">
            <div className="mb-8">
              <span className="section-label">شوهد مؤخراً</span>
              <h2 className="mt-3 text-2xl font-extrabold text-foreground">منتجات اطلعت عليها مؤخراً</h2>
            </div>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {recentProducts.slice(0, 6).map((p: any) => (
                <Link key={p.id} to={`/product/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-card-hover">
                  <div className="aspect-square overflow-hidden bg-accent/30">
                    {p.image_url ? <img src={p.image_url} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> :
                      <div className="flex h-full items-center justify-center"><Package className="h-8 w-8 text-muted-foreground/30" /></div>}
                  </div>
                  <p className="p-3 text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary">{p.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="border-t border-border py-16">
        <div className="container max-w-3xl">
          <div className="mb-8 text-center">
            <span className="section-label mx-auto justify-center">أسئلة شائعة</span>
            <h2 className="mt-3 text-2xl lg:text-3xl font-extrabold text-foreground">الأسئلة الأكثر شيوعاً</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {productFAQ.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-border bg-card px-5 shadow-card [&[data-state=open]]:border-primary/40">
                <AccordionTrigger className="text-right text-sm font-bold text-foreground hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
