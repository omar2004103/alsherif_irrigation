import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, MessageCircle, Phone, FileText, Download, Share2, Printer,
  Copy, Package, Plus, Minus, ShieldCheck, Truck, Award, Sparkles, Mail, Clock,
  ChevronRight, X as CloseIcon, ZoomIn, Star, Heart, Repeat, CheckCircle2,
  FileCheck, Droplets, Layers, Shield, Maximize2, Gauge, Globe, Sliders, Check
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import { useProductBySlug, useProductImages, useProducts, useCategories, useProductsByIds, useSiteSettings } from '@/hooks/useSupabaseData';
import { useQuoteCart } from '@/hooks/useQuoteCart';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const AVAIL: Record<string, string> = {
  available: 'متوفر في المخزون',
  on_request: 'متوفر عند الطلب',
  contact_us: 'تواصل معنا للتفاصيل',
  out_of_stock: 'غير متوفر حالياً',
};


// Smart icon mapper for technical specifications
const getSpecIcon = (label: string) => {
  const l = (label || '').toLowerCase();
  if (l.includes('طول') || l.includes('مسافة') || l.includes('قطر') || l.includes('سمك') || l.includes('عرض') || l.includes('ارتفاع') || l.includes('مقاس')) {
    return <Maximize2 className="h-5 w-5 text-indigo-600" />;
  }
  if (l.includes('تصريف') || l.includes('مياه') || l.includes('تدفق') || l.includes('تنقيط') || l.includes('ري') || l.includes('سعة')) {
    return <Droplets className="h-5 w-5 text-sky-600" />;
  }
  if (l.includes('ضغط') || l.includes('بار') || l.includes('تحمل') || l.includes('قدرة')) {
    return <Gauge className="h-5 w-5 text-rose-600" />;
  }
  if (l.includes('خام') || l.includes('مادة') || l.includes('بولي') || l.includes('pvc') || l.includes('pe') || l.includes('طبقة')) {
    return <Layers className="h-5 w-5 text-emerald-600" />;
  }
  if (l.includes('ضمان') || l.includes('شهادة') || l.includes('جودة') || l.includes('أمان')) {
    return <ShieldCheck className="h-5 w-5 text-amber-600" />;
  }
  if (l.includes('منشأ') || l.includes('صنع') || l.includes('بلد') || l.includes('ماركة') || l.includes('شركة')) {
    return <Globe className="h-5 w-5 text-teal-600" />;
  }
  if (l.includes('فلتر') || l.includes('مش') || l.includes('ميكرون') || l.includes('تنقية')) {
    return <Sliders className="h-5 w-5 text-purple-600" />;
  }
  return <Sparkles className="h-5 w-5 text-emerald-600" />;
};

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIdx, setZoomIdx] = useState(0);

  const openZoom = (i: number) => { setZoomIdx(i); setZoomOpen(true); };
  const safeActive = active < images.length ? active : 0;
  const currentImage = images[safeActive];

  return (
    <div className="space-y-4">
      <div className={`grid ${images.length > 1 ? 'grid-cols-1 sm:grid-cols-[80px_1fr]' : 'grid-cols-1'} gap-4`}>
        {/* Thumbnails list */}
        {images.length > 1 && (
          <div className="order-2 sm:order-1 flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[440px] p-1">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`h-16 w-16 sm:h-20 sm:w-20 shrink-0 aspect-square overflow-hidden rounded-xl border-2 p-1 transition-all bg-card/80 backdrop-blur-sm flex items-center justify-center cursor-pointer ${
                  i === safeActive ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-105 shadow-sm' : 'border-border/80 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="max-h-full max-w-full object-contain rounded-lg" />
              </button>
            ))}
          </div>
        )}

        {/* Main View Container */}
        <div
          className="order-1 sm:order-2 group relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-muted/20 to-card p-6 cursor-zoom-in shadow-card flex items-center justify-center"
          onClick={() => currentImage && openZoom(safeActive)}
        >
          {/* Top Badges */}
          <div className="absolute top-4 inset-x-4 z-10 flex items-center justify-between pointer-events-none">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> متوفر
            </span>
            <span className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-black text-white shadow-sm">
              الأكثر مبيعاً
            </span>
          </div>

          {currentImage ? (
            <img
              src={currentImage}
              alt={title}
              className="relative z-0 max-h-full max-w-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/30">
              <Package className="h-24 w-24" strokeWidth={1.2} />
            </div>
          )}

          {currentImage && (
            <button
              onClick={(e) => { e.stopPropagation(); openZoom(safeActive); }}
              className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-xl bg-card/90 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-foreground border border-border/60 shadow-md opacity-0 group-hover:opacity-100 transition-all"
            >
              <ZoomIn className="h-3.5 w-3.5 text-primary" /> تكبير الصورة
            </button>
          )}
        </div>
      </div>

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
            <img src={images[zoomIdx]} alt={title} className="max-h-[85vh] w-full rounded-2xl object-contain bg-card p-4" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ProductDetailsPage = () => {
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const slug = useMemo(() => {
    if (!rawSlug) return '';
    try {
      return decodeURIComponent(rawSlug).trim();
    } catch {
      return rawSlug.trim();
    }
  }, [rawSlug]);

  // 1. Scroll to top immediately when slug changes or component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  const { data: product, isLoading } = useProductBySlug(slug);
  const { data: allImages } = useProductImages(product?.id ?? '');
  const { data: categories } = useCategories();
  const { data: allProducts } = useProducts();
  const { data: siteSettings } = useSiteSettings();
  const { add: addToQuote } = useQuoteCart();
  const { ids: recentIds, track } = useRecentlyViewed();
  const { data: recentProducts } = useProductsByIds(recentIds.filter((id) => id !== product?.id));

  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedPressure, setSelectedPressure] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'specs' | 'sizes' | 'description' | 'applications' | 'files' | 'related'>('specs');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => { if (product?.id) track(product.id); }, [product?.id, track]);

  const category = useMemo(() => categories?.find((c: any) => c.id === product?.category_id), [categories, product]);

  const related = useMemo(() => {
    if (!allProducts || !product) return [];
    return allProducts
      .filter((p: any) => p.id !== product.id && p.category_id === product.category_id)
      .slice(0, 5);
  }, [allProducts, product]);

  const images = useMemo(() => {
    const list: string[] = [];
    if (product?.image_url) list.push(product.image_url);
    (allImages || []).forEach((img: any) => { if (img.image_url && !list.includes(img.image_url)) list.push(img.image_url); });
    return list;
  }, [product, allImages]);

  // Modular Specs & Dimensions Matrix Parsing
  const { technicalSpecs, sizesMatrix, hasMatrix } = useMemo(() => {
    let tSpecs: Array<{ label: string; value: string }> = [];
    let sMatrix: Array<{ size: string; outer: string; inner: string; wall: string; radius: string; pressure: string }> = [];
    let matrixEnabled = false;

    if (product?.specs) {
      if (Array.isArray(product.specs)) {
        tSpecs = product.specs
          .map((item: any) => ({
            label: item.label || item.key || item.name || '',
            value: item.value || ''
          }))
          .filter(s => s.label || s.value);
      } else if (typeof product.specs === 'object') {
        if (Array.isArray(product.specs.technical_specs)) {
          tSpecs = product.specs.technical_specs
            .map((item: any) => ({
              label: item.label || item.key || item.name || '',
              value: item.value || ''
            }))
            .filter(s => s.label || s.value);
        }
        if (Array.isArray(product.specs.sizes_matrix) && product.specs.sizes_matrix.length > 0) {
          sMatrix = product.specs.sizes_matrix.filter((r: any) => r && r.size);
          matrixEnabled = Boolean(product.specs.has_matrix ?? (sMatrix.length > 0));
        }
      }
    }

    if (Array.isArray((product as any)?.technical_specs) && (product as any).technical_specs.length > 0) {
      tSpecs = (product as any).technical_specs
        .map((item: any) => ({
          label: item.label || item.key || item.name || '',
          value: item.value || ''
        }))
        .filter((s: any) => s.label || s.value);
    }

    if (Array.isArray((product as any)?.sizes_matrix) && (product as any).sizes_matrix.length > 0) {
      sMatrix = (product as any).sizes_matrix.filter((r: any) => r && r.size);
      matrixEnabled = true;
    }

    return {
      technicalSpecs: tSpecs,
      sizesMatrix: sMatrix,
      hasMatrix: matrixEnabled && sMatrix.length > 0
    };
  }, [product]);

  // 1. Available Sizes
  const availableSizes = useMemo(() => {
    if (product?.sizes && product.sizes.length > 0) return product.sizes;
    if (hasMatrix && sizesMatrix.length > 0) {
      return sizesMatrix.map(m => m.size).filter(Boolean);
    }
    return [];
  }, [product, hasMatrix, sizesMatrix]);

  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0]);
    } else if (availableSizes.length === 0 && selectedSize !== '') {
      setSelectedSize('');
    }
  }, [availableSizes, selectedSize]);

  // 2. Available Pressures (strictly in Bar)
  const availablePressures = useMemo(() => {
    let pList: string[] = [];
    if (product?.specs && typeof product.specs === 'object' && Array.isArray(product.specs.pressures)) {
      pList = product.specs.pressures.filter(Boolean);
    } else if (Array.isArray((product as any)?.pressures)) {
      pList = (product as any).pressures.filter(Boolean);
    }
    if (pList.length === 0 && hasMatrix && sizesMatrix.length > 0) {
      const fromMatrix = Array.from(new Set(sizesMatrix.map(m => m.pressure).filter(Boolean)));
      if (fromMatrix.length > 0) pList = fromMatrix as string[];
    }
    return pList;
  }, [product, hasMatrix, sizesMatrix]);

  useEffect(() => {
    if (availablePressures.length > 0 && !availablePressures.includes(selectedPressure)) {
      setSelectedPressure(availablePressures[0]);
    } else if (availablePressures.length === 0 && selectedPressure !== '') {
      setSelectedPressure('');
    }
  }, [availablePressures, selectedPressure]);

  // 3. Product Features (Dynamic with Green Badges)
  const productFeatures = useMemo(() => {
    let feats: string[] = [];
    if (Array.isArray(product?.features)) {
      feats = product.features
        .map((f: any) => (typeof f === 'string' ? f : (f?.title || f?.name || f?.feature || '')))
        .filter(Boolean);
    } else if (product?.specs && typeof product.specs === 'object' && Array.isArray(product.specs.features)) {
      feats = product.specs.features.filter(Boolean);
    }
    return feats;
  }, [product]);

  // 4. Product Applications
  const productApplications = useMemo(() => {
    if (Array.isArray(product?.applications) && product.applications.length > 0) {
      return product.applications
        .map((a: any) => (typeof a === 'string' ? a : (a?.title || a?.name || '')))
        .filter(Boolean);
    }
    return [
      'أنظمة الري بالتنقيط والري المحوري الحديثة',
      'شبكات توزيع ونقل المياه الزراعية والصناعية',
      'المزارع المكشوفة والبيوت المحمية',
      'مشاريع استصلاح الأراضي والحدائق الكبرى',
    ];
  }, [product]);

  // 5. WhatsApp Dynamic Pre-filled Inquiry Link with selected size & pressure
  const whatsappNumber = siteSettings?.whatsapp || '201028200048';
  const sku = product?.product_code || (product?.slug ? `SKU-${product.slug.toUpperCase()}` : (product?.id ? `SKU-${product.id.slice(0, 6)}` : ''));
  const sizeText = selectedSize || 'حسب المتوفر';
  const pressureText = selectedPressure || (availablePressures.length > 0 ? availablePressures[0] : 'قياسي');
  const whatsappMessage = product
    ? `السلام عليكم شركة آل شريف للري، أود الاستفسار وطلب عرض سعر بخصوص: ${product.title}${sku ? ` (كود: ${sku})` : ''} - مقاس: ${sizeText} - ضغط: ${pressureText}`
    : '';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleAddToQuote = () => {
    if (!product) return;
    addToQuote(
      { id: product.id, title: product.title, slug: product.slug || product.id, image: product.image_url, brand: product.brand, product_code: product.product_code },
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
        <div className="container pt-36 pb-20 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="aspect-square animate-pulse rounded-3xl bg-muted" />
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

  const canonicalUrl = `https://alsherif-irrigation.lovable.app/product/${encodeURIComponent(product.slug || product.id)}`;

  return (
    <div className="min-h-screen bg-background text-right" dir="rtl">
      <Helmet>
        <title>{product.meta_title || `${product.title} — آل شريف`}</title>
        <meta name="description" content={product.meta_description || product.description || `${product.title} من آل شريف لنظم الري الحديث`} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <Navbar />
      <FloatingActions />

      {/* Top Breadcrumb Bar */}
      <section className="border-b border-border bg-card pt-28 pb-4">
        <div className="container">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground/60" />
            <Link to="/products" className="hover:text-primary transition-colors">المنتجات</Link>
            {category && (
              <>
                <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground/60" />
                <Link to={`/products?cat=${category.id}`} className="hover:text-primary transition-colors">{category.name}</Link>
              </>
            )}
            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="font-bold text-foreground line-clamp-1">{product.title}</span>
          </nav>
        </div>
      </section>

      {/* Main Product Display (Matching Reference Screenshot) */}
      <section className="py-10">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            
            {/* Gallery Column (Left side in LTR, Right in RTL) */}
            <div className="space-y-6">
              <Gallery images={images} title={product.title} />

              {/* 4 Feature Badges Under Image Box */}
              <div className="grid grid-cols-4 gap-3 border-t border-border pt-4">
                {[
                  { icon: Truck, title: 'توصيل سريع', desc: 'خلال 1-3 أيام عمل' },
                  { icon: Droplets, title: 'مقاومة للتآكل', desc: 'مقاوم للأشعة والمواد الكيميائية' },
                  { icon: Layers, title: 'تحمل ضغط عالي', desc: 'حتى 16 بار' },
                  { icon: Shield, title: 'ضمان الجودة', desc: 'جودة عالمية معتمدة' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center p-2 bg-accent/20 rounded-2xl border border-border/40">
                    <item.icon className="h-5 w-5 text-emerald-600 mb-1.5" strokeWidth={1.75} />
                    <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details Info Column */}
            <div className="flex flex-col space-y-6">
              {/* Brand Logo & Name */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> {AVAIL[product.availability] || AVAIL.available}
                </span>

                {product.brand && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-primary font-mono">{product.brand}</span>
                  </div>
                )}
              </div>

              {/* Title & Product Code */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-foreground leading-tight tracking-tight">
                  {product.title}
                </h1>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>القسم: <strong className="text-foreground">{category?.name || 'مواسير PVC'}</strong></span>
                  <span>•</span>
                  <span>رمز المنتج: <strong className="text-foreground font-mono" dir="ltr">#{product.product_code || `SKU-${product.slug.toUpperCase()}`}</strong></span>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description || 'مصنوع من مادة PVC عالية الجودة لتحمل الضغط العالي والآكل، يستخدم في أنظمة الري الحديث وشبكات المياه الزراعية.'}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-foreground">4.8</span>
                <span className="text-muted-foreground">(تقييمات 128)</span>
              </div>

              {/* Product Feature Badges (Green Checkmarks) */}
              {productFeatures.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {productFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 px-3 py-1.5 text-xs font-bold shadow-2xs"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      {feat}
                    </span>
                  ))}
                </div>
              )}

              {/* Sizes Selection Pills (Only rendered if sizes exist) */}
              {availableSizes.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-extrabold text-foreground">المقاسات المتاحة:</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((sz: string) => {
                      const isSelected = selectedSize === sz;
                      return (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                              : 'border-border bg-card text-foreground hover:border-emerald-500/50'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pressure Selection Pills (Only rendered if pressures exist!) */}
              {availablePressures.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-extrabold text-foreground">خيارات الضغط المتاحة (بار):</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availablePressures.map((p) => {
                      const isSelected = selectedPressure === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setSelectedPressure(p)}
                          className={`rounded-xl px-5 py-2 text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                              : 'border-border bg-card text-foreground hover:border-emerald-500/50'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Secondary Action Icons Row */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                    isFavorite ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-border bg-card text-foreground hover:bg-accent'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-rose-600' : ''}`} /> المفضلة
                </button>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-xs font-bold text-foreground hover:bg-accent"
                >
                  <Share2 className="h-4 w-4" /> الاستفسار / مشاركة
                </button>

                <button
                  onClick={() => toast.info('تمت إضافة المنتج للمقارنة')}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-xs font-bold text-foreground hover:bg-accent"
                >
                  <Repeat className="h-4 w-4" /> إضافة للمقارنة
                </button>
              </div>

              {/* Primary Action Buttons: WhatsApp Quick Quote & Quote Cart */}
              <div className="space-y-2.5 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 px-5 text-base font-black shadow-md transition-all duration-300 hover:scale-[1.01]"
                >
                  <MessageCircle className="h-5 w-5" /> طلب عرض سعر سريع عبر واتساب
                </a>

                <button
                  onClick={handleAddToQuote}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--sherif-blue-deep))] hover:bg-primary py-3.5 px-5 text-sm font-extrabold text-white shadow-hero transition-all duration-300 hover:scale-[1.01]"
                >
                  <FileText className="h-5 w-5" /> إضافة للطلب / استفسار مخصص
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Middle Interactive Navigation Tabs Bar */}
      <section className="border-t border-border bg-muted/20 py-8">
        <div className="container">
          <div className="flex items-center justify-start gap-3 overflow-x-auto pb-3 border-b border-border/60">
            {[
              { id: 'specs', label: 'المواصفات الفنية' },
              ...(hasMatrix && sizesMatrix.length > 0 ? [{ id: 'sizes', label: 'المقاسات والأبعاد' }] : []),
              { id: 'description', label: 'الوصف' },
              { id: 'applications', label: 'التطبيقات' },
              { id: 'files', label: 'الملفات والكتالوج' },
              ...(related.length > 0 ? [{ id: 'related', label: `منتجات ذات صلة (${related.length})` }] : []),
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative whitespace-nowrap px-5 py-2.5 text-sm font-extrabold transition-all rounded-xl ${
                    active ? 'bg-card text-emerald-600 shadow-sm border border-emerald-500/20' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  {active && (
                    <motion.div layoutId="tabUnderline" className="absolute bottom-0 inset-x-3 h-0.5 bg-emerald-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="mt-8">
            {activeTab === 'specs' && (
              <div className="space-y-8">
                {/* 1. Specifications Cards Grid (عرض مواصفات الخراطيم والأجهزة والمنتجات) */}
                {technicalSpecs.length > 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <h3 className="text-base font-black text-foreground flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-600" /> المواصفات والخصائص الفنية
                      </h3>
                      <span className="text-xs font-bold text-muted-foreground bg-accent/40 px-2.5 py-1 rounded-lg">
                        {technicalSpecs.length} مواصفات
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                      {technicalSpecs.map((s, idx) => (
                        <div
                          key={idx}
                          className="group flex items-start gap-3 rounded-2xl border border-border/80 bg-background/80 p-4 shadow-xs hover:border-emerald-500/50 hover:bg-card transition-all"
                        >
                          <div className="rounded-xl bg-accent/50 p-2.5 shrink-0 group-hover:scale-105 transition-transform">
                            {getSpecIcon(s.label)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block text-[11px] font-bold text-muted-foreground line-clamp-1">
                              {s.label}
                            </span>
                            <span className="mt-1 block text-sm font-black text-foreground break-words">
                              {s.value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* If product has no technical specs and no matrix */
                  !hasMatrix && (
                    <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
                      <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                      <h4 className="text-base font-bold text-foreground">المواصفات والبيانات الفنية</h4>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        تواصل معنا مباشرة عبر واتساب للحصول على تفاصيل المواصفات والكتالوج الفني الكامل لهذا المنتج.
                      </p>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-sm"
                      >
                        <MessageCircle className="h-4 w-4" /> طلب المواصفات عبر واتساب
                      </a>
                    </div>
                  )
                )}

                {/* 2. Conditional Dimensions Matrix Table (ONLY renders if product actually has matrix data) */}
                {hasMatrix && sizesMatrix.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <h3 className="text-base font-black text-foreground flex items-center gap-2">
                        <Layers className="h-5 w-5 text-indigo-600" /> جدول الأبعاد والمقاسات الهندسية (مم)
                      </h3>
                      <span className="text-[11px] text-muted-foreground bg-accent/30 px-2.5 py-1 rounded-lg">
                        {sizesMatrix.length} مقاسات هندسية
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
                            <th className="p-3">المقاس</th>
                            <th className="p-3">القطر الخارجي (D)</th>
                            <th className="p-3">القطر الداخلي (d)</th>
                            <th className="p-3">السمك (t)</th>
                            <th className="p-3">نصف القطر (R)</th>
                            <th className="p-3">الضغط</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {sizesMatrix.map((row, idx) => {
                            const isCurrent = selectedSize.includes(row.size);
                            return (
                              <tr key={idx} className={`transition-colors ${isCurrent ? 'bg-emerald-500/10 font-bold text-emerald-700' : 'hover:bg-accent/40'}`}>
                                <td className="p-3 font-bold">{row.size}</td>
                                <td className="p-3">{row.outer || '—'}</td>
                                <td className="p-3">{row.inner || '—'}</td>
                                <td className="p-3">{row.wall || '—'}</td>
                                <td className="p-3">{row.radius || '—'}</td>
                                <td className="p-3">{row.pressure || '—'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-[11px] text-muted-foreground text-center">جميع المقاسات بالمم - قد تختلف القيم بنسبة ±2%</p>
                  </div>
                )}
              </div>
            )}

            {activeTab !== 'specs' && (
              <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground leading-relaxed">
                {activeTab === 'description' && (
                  <p>{product.description || 'مصنوع من خامات عالية الجودة لتحمل ظروف التشغيل والضغط، يستخدم في أنظمة الري الحديث وشبكات المياه الزراعية.'}</p>
                )}
                {activeTab === 'sizes' && (
                  hasMatrix && sizesMatrix.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
                            <th className="p-3">المقاس</th>
                            <th className="p-3">القطر الخارجي (D)</th>
                            <th className="p-3">القطر الداخلي (d)</th>
                            <th className="p-3">السمك (t)</th>
                            <th className="p-3">نصف القطر (R)</th>
                            <th className="p-3">الضغط</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {sizesMatrix.map((row, idx) => (
                            <tr key={idx} className="hover:bg-accent/20">
                              <td className="p-3 font-bold">{row.size}</td>
                              <td className="p-3">{row.outer || '—'}</td>
                              <td className="p-3">{row.inner || '—'}</td>
                              <td className="p-3">{row.wall || '—'}</td>
                              <td className="p-3">{row.radius || '—'}</td>
                              <td className="p-3">{row.pressure || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : availableSizes.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {availableSizes.map(s => (
                        <div key={s} className="p-4 rounded-xl border border-border bg-accent/30 text-center font-bold text-foreground">
                          {s}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center">لا توجد مقاسات محددة لهذا المنتج.</p>
                  )
                )}
                {activeTab === 'applications' && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {productApplications.map(item => (
                      <li key={item} className="flex items-center gap-2.5 p-3.5 rounded-xl border border-border bg-card font-bold text-foreground text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                )}
                {activeTab === 'files' && (
                  <p className="text-center text-xs text-muted-foreground py-6">
                    {product?.pdf_url ? (
                      <a
                        href={product.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 font-bold text-xs hover:bg-primary/90"
                      >
                        <FileText className="h-4 w-4" /> تحميل الكتالوج الفني للمنتج (PDF) ↗
                      </a>
                    ) : (
                      'لا توجد ملفات مرفقة لهذا المنتج حالياً. تواصل معنا للحصول على الكتالوج الفني.'
                    )}
                  </p>
                )}
                {activeTab === 'related' && (
                  <p className="text-center text-xs text-muted-foreground py-6">انظر قسم المنتجات ذات الصلة أسفل الصفحة.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Blueprint Diagram & Technical Features Row */}
      <section className="py-12">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Technical Diagram */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center flex flex-col items-center justify-center">
              <h4 className="mb-4 text-sm font-black text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> الرسم التخطيطي الفني
              </h4>
              <div className="relative aspect-square w-48 border border-dashed border-primary/30 rounded-xl bg-accent/20 p-4 flex items-center justify-center overflow-hidden">
                {product?.drawing_url ? (
                  <img src={product.drawing_url} alt="الرسم الفني" className="max-h-full max-w-full object-contain" />
                ) : (
                  <>
                    <Package className="h-20 w-20 text-primary/40" />
                    <span className="absolute bottom-2 text-[10px] text-muted-foreground font-mono">
                      {product?.product_code || `#SKU-${product?.slug?.toUpperCase() || product?.id?.slice(0, 6)}`}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Features List (Clean Green Badges) */}
            {productFeatures.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h4 className="mb-4 text-sm font-black text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" /> مميزات المنتج
                </h4>
                <ul className="space-y-3 text-xs font-semibold text-foreground">
                  {productFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Applications List */}
            {productApplications.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h4 className="mb-4 text-sm font-black text-foreground flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-sky-600" /> التطبيقات والاستخدام
                </h4>
                <ul className="space-y-3 text-xs font-semibold text-foreground">
                  {productApplications.map((app, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 border border-sky-500/30">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products Slider Section */}
      {related.length > 0 && (
        <section className="border-t border-border py-14 bg-muted/20">
          <div className="container">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-foreground">منتجات ذات صلة</h2>
              <Link to="/products" className="text-xs font-bold text-primary hover:underline">عرض الكل ←</Link>
            </div>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {related.map((p: any) => (
                <div key={p.id} className="group rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm hover:shadow-card-hover transition-all flex flex-col h-full">
                  <div className="relative aspect-[4/3] w-full bg-gradient-to-b from-muted/20 to-card p-3 flex items-center justify-center">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <Package className="h-10 w-10 text-muted-foreground/30" />
                    )}
                    {p.brand && (
                      <span className="absolute bottom-2 right-2 font-mono text-[10px] font-bold text-primary bg-card/90 px-1.5 py-0.5 rounded border">
                        {p.brand}
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1 text-right">
                    <h3 className="mb-1 text-xs font-black text-foreground line-clamp-1 group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="mb-3 text-[10px] text-muted-foreground">من 20 مم إلى 160 مم</p>
                    <Link
                      to={`/product/${p.slug}`}
                      className="mt-auto block w-full text-center rounded-lg border border-border py-1.5 text-[11px] font-bold text-foreground hover:bg-accent"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
