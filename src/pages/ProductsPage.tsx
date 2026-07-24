import { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, ChevronLeft, Eye, FileText,
  MessageCircle, Package, CheckCircle2, Clock3, PhoneCall, Plus, ArrowLeft,
  ArrowUpDown, Sparkles, Droplets
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import { useProducts, useCategories } from '@/hooks/useSupabaseData';
import { useQuoteCart } from '@/hooks/useQuoteCart';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const PAGE_SIZE = 12;

type Product = any;

const AVAIL_LABELS: Record<string, { label: string; icon: any; className: string }> = {
  available: { label: 'متوفر', icon: CheckCircle2, className: 'text-secondary bg-[hsl(115,43%,92%)]' },
  on_request: { label: 'متوفر عند الطلب', icon: Clock3, className: 'text-[hsl(32,95%,44%)] bg-[hsl(32,95%,94%)]' },
  contact_us: { label: 'تواصل معنا', icon: PhoneCall, className: 'text-primary bg-accent' },
  out_of_stock: { label: 'غير متوفر حالياً', icon: X, className: 'text-muted-foreground bg-muted' },
};

function AvailabilityBadge({ value }: { value: string }) {
  const cfg = AVAIL_LABELS[value] ?? AVAIL_LABELS.available;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.className}`}>
      <Icon className="h-3 w-3" />{cfg.label}
    </span>
  );
}

function ProductCard({ product, categoryName, onPreview, onAddQuote }: {
  product: Product; categoryName?: string; onPreview: (p: Product) => void; onAddQuote: (p: Product) => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.35 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-accent/30">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
            <Package className="h-14 w-14" strokeWidth={1.2} />
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <AvailabilityBadge value={product.availability || 'available'} />
          {product.featured && (
            <span className="rounded-full bg-[hsl(32,95%,44%)] px-2.5 py-1 text-[11px] font-bold text-white">مميز</span>
          )}
        </div>
        <button
          onClick={() => onPreview(product)}
          className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-lg bg-card/95 backdrop-blur px-4 py-2 text-xs font-bold text-foreground opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
        >
          <Eye className="h-3.5 w-3.5" /> معاينة سريعة
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
          {categoryName && (
            <span className="font-semibold uppercase tracking-wider text-secondary">{categoryName}</span>
          )}
          {product.product_code && (
            <span className="text-muted-foreground" dir="ltr">#{product.product_code}</span>
          )}
        </div>
        <h3 className="mb-1.5 text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        {product.brand && <p className="mb-2 text-xs text-muted-foreground">الماركة: <span className="font-semibold text-foreground">{product.brand}</span></p>}
        {product.description && (
          <p className="mb-4 text-sm text-muted-foreground leading-relaxed line-clamp-2">{product.description}</p>
        )}
        <div className="mt-auto flex gap-2">
          <Link
            to={`/product/${product.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-bold text-foreground transition-colors hover:bg-accent hover:text-primary"
          >
            التفاصيل <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => onAddQuote(product)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground shadow-button transition-all hover:-translate-y-0.5"
          >
            <FileText className="h-3.5 w-3.5" /> عرض سعر
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function CardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="flex gap-2 pt-2">
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-muted" />
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}

function FiltersPanel({
  categories, selectedCategories, toggleCategory,
  brands, selectedBrands, toggleBrand,
  availabilities, selectedAvailability, toggleAvailability,
  sizes, selectedSizes, toggleSize,
  onClear,
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-foreground">الأقسام</h3>
        </div>
        <ul className="space-y-1.5">
          {categories.map((c: any) => (
            <li key={c.id}>
              <label className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground/85 transition-colors hover:bg-accent">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(c.id)}
                    onChange={() => toggleCategory(c.id)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  {c.name}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {brands.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-extrabold text-foreground">الماركات</h3>
          <ul className="space-y-1.5">
            {brands.map((b: string) => (
              <li key={b}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/85 hover:bg-accent">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b)}
                    onChange={() => toggleBrand(b)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  {b}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-extrabold text-foreground">التوفر</h3>
        <ul className="space-y-1.5">
          {availabilities.map((a: string) => (
            <li key={a}>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/85 hover:bg-accent">
                <input
                  type="checkbox"
                  checked={selectedAvailability.includes(a)}
                  onChange={() => toggleAvailability(a)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                {AVAIL_LABELS[a]?.label ?? a}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {sizes.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-extrabold text-foreground">المقاسات</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s: string) => (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedSizes.includes(s)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onClear}
        className="w-full rounded-lg border border-border py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-accent"
      >
        مسح جميع الفلاتر
      </button>
    </div>
  );
}

const ProductsPage = () => {
  const [params, setParams] = useSearchParams();
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { add: addToQuote } = useQuoteCart();

  const [search, setSearch] = useState(params.get('q') ?? '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    params.get('cat') ? params.get('cat')!.split(',') : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'featured' | 'name_asc' | 'name_desc'>('featured');

  useEffect(() => {
    const p = new URLSearchParams();
    if (search) p.set('q', search);
    if (selectedCategories.length) p.set('cat', selectedCategories.join(','));
    setParams(p, { replace: true });
    setPage(1);
  }, [search, selectedCategories, selectedBrands, selectedAvailability, selectedSizes]);

  const brands = useMemo(() => {
    const s = new Set<string>();
    products?.forEach((p: any) => p.brand && s.add(p.brand));
    return [...s].sort();
  }, [products]);

  const sizes = useMemo(() => {
    const s = new Set<string>();
    products?.forEach((p: any) => (p.sizes || []).forEach((sz: string) => s.add(sz)));
    return [...s].sort();
  }, [products]);

  const availabilities = ['available', 'on_request', 'contact_us'];

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    const list = products.filter((p: any) => {
      if (q) {
        const hay = [p.title, p.description, p.brand, p.product_code].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (selectedCategories.length && !selectedCategories.includes(p.category_id)) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (selectedAvailability.length && !selectedAvailability.includes(p.availability || 'available')) return false;
      if (selectedSizes.length && !(p.sizes || []).some((s: string) => selectedSizes.includes(s))) return false;
      return true;
    });
    const sorted = [...list];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        break;
      case 'oldest':
        sorted.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
        break;
      case 'name_asc':
        sorted.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ar'));
        break;
      case 'name_desc':
        sorted.sort((a, b) => (b.title || '').localeCompare(a.title || '', 'ar'));
        break;
      default:
        sorted.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }
    return sorted;
  }, [products, search, selectedCategories, selectedBrands, selectedAvailability, selectedSizes, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getCategoryName = (id: string) => categories?.find((c: any) => c.id === id)?.name;

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const clearAll = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedAvailability([]);
    setSelectedSizes([]);
  };

  const handleAddQuote = (p: Product) => {
    addToQuote({
      id: p.id, title: p.title, slug: p.slug, image: p.image_url,
      brand: p.brand, product_code: p.product_code,
    });
    toast.success('تمت الإضافة إلى طلب عرض السعر', {
      description: p.title,
      action: { label: 'عرض الطلب', onClick: () => (window.location.href = '/quote') },
    });
  };

  const activeFilterCount =
    selectedCategories.length + selectedBrands.length + selectedAvailability.length + selectedSizes.length;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>المنتجات — آل شريف لنظم الري الحديث</title>
        <meta name="description" content="تشكيلة شاملة من منتجات الري الحديث: تنقيط، رشاشات، مواسير PVC، محابس، طلمبات، وفلاتر — من ماركات عالمية معتمدة." />
        <link rel="canonical" href="https://alsherif-irrigation.lovable.app/products" />
        <meta property="og:title" content="المنتجات — آل شريف لنظم الري الحديث" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://alsherif-irrigation.lovable.app/' },
            { '@type': 'ListItem', position: 2, name: 'المنتجات', item: 'https://alsherif-irrigation.lovable.app/products' },
          ],
        })}</script>
      </Helmet>

      <Navbar />
      <FloatingActions />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[hsl(var(--sherif-blue-deep))] pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="absolute inset-0 blueprint-grid opacity-[0.08]" />
        <div className="container relative">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-primary-foreground/70">
            <Link to="/" className="hover:text-primary-foreground transition-colors">الرئيسية</Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="text-primary-foreground font-semibold">المنتجات</span>
          </nav>
          <div className="max-w-3xl">
            <span className="section-label !text-primary-foreground/70 before:!bg-primary-foreground/40">Products</span>
            <h1 className="mt-4 text-4xl lg:text-5xl font-extrabold text-primary-foreground tracking-tight">
              كتالوج منتجات الري الحديث
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
              تشكيلة هندسية شاملة من أنظمة الري بالتنقيط والرشاشات، مواسير PVC، المحابس، الفلاتر، والطلمبات — من ماركات عالمية معتمدة.
            </p>
          </div>
        </div>
      </section>

      {/* Category cards */}
      {categories && categories.length > 0 && (
        <section className="border-b border-border bg-gradient-to-b from-accent/30 to-background py-14 lg:py-20">
          <div className="container">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="section-label">Categories</span>
                <h2 className="mt-2 text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
                  تصفح حسب القسم
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-lg">
                  اختر القسم المناسب لمشروعك للاطلاع على المنتجات والمواصفات الهندسية.
                </p>
              </div>
              <button
                onClick={() => setSelectedCategories([])}
                className="self-start rounded-lg border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-accent transition-colors"
              >
                عرض كل الأقسام
              </button>
            </div>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((c: any, idx: number) => {
                const active = selectedCategories.includes(c.id);
                const count = products?.filter((p: any) => p.category_id === c.id).length || 0;
                return (
                  <motion.button
                    key={c.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
                    onClick={() => toggle(selectedCategories, setSelectedCategories, c.id)}
                    className={`group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border p-6 text-right transition-all duration-300 hover:-translate-y-1 ${
                      active
                        ? 'border-primary bg-card shadow-card-hover ring-2 ring-primary/20'
                        : 'border-border bg-card hover:border-primary/40 hover:shadow-card-hover'
                    }`}
                  >
                    <div className="absolute top-0 left-0 h-24 w-24 -translate-x-8 -translate-y-8 rounded-full bg-primary/[0.04] transition-transform duration-500 group-hover:scale-150" />
                    <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
                      active ? 'bg-primary text-primary-foreground' : 'bg-accent text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                    }`}>
                      <Droplets className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                    <div className="relative flex-1">
                      <h3 className="text-base font-extrabold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {c.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {count} منتج
                      </p>
                    </div>
                    <div className="relative flex items-center gap-1 text-xs font-bold text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                      تصفية <ChevronLeft className="h-3.5 w-3.5" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Search + filters + grid */}
      <section className="py-12">
        <div className="container">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم المنتج أو كود المنتج أو الماركة..."
                className="w-full rounded-xl border border-border bg-card py-3.5 pr-11 pl-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="relative">
              <ArrowUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none rounded-xl border border-border bg-card py-3.5 pr-10 pl-8 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="ترتيب المنتجات"
              >
                <option value="featured">المميزة أولاً</option>
                <option value="newest">الأحدث</option>
                <option value="oldest">الأقدم</option>
                <option value="name_asc">الاسم: أ - ي</option>
                <option value="name_desc">الاسم: ي - أ</option>
              </select>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-bold text-foreground transition-colors hover:bg-accent lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" /> الفلاتر
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{activeFilterCount}</span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[86%] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-right">الفلاتر</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersPanel
                    categories={categories || []}
                    selectedCategories={selectedCategories}
                    toggleCategory={(v: string) => toggle(selectedCategories, setSelectedCategories, v)}
                    brands={brands}
                    selectedBrands={selectedBrands}
                    toggleBrand={(v: string) => toggle(selectedBrands, setSelectedBrands, v)}
                    availabilities={availabilities}
                    selectedAvailability={selectedAvailability}
                    toggleAvailability={(v: string) => toggle(selectedAvailability, setSelectedAvailability, v)}
                    sizes={sizes}
                    selectedSizes={selectedSizes}
                    toggleSize={(v: string) => toggle(selectedSizes, setSelectedSizes, v)}
                    onClear={clearAll}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{filtered.length}</span>
              <span>منتج</span>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="mb-5 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-extrabold text-foreground">الفلاتر</h2>
                  {activeFilterCount > 0 && (
                    <span className="mr-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <FiltersPanel
                  categories={categories || []}
                  selectedCategories={selectedCategories}
                  toggleCategory={(v: string) => toggle(selectedCategories, setSelectedCategories, v)}
                  brands={brands}
                  selectedBrands={selectedBrands}
                  toggleBrand={(v: string) => toggle(selectedBrands, setSelectedBrands, v)}
                  availabilities={availabilities}
                  selectedAvailability={selectedAvailability}
                  toggleAvailability={(v: string) => toggle(selectedAvailability, setSelectedAvailability, v)}
                  sizes={sizes}
                  selectedSizes={selectedSizes}
                  toggleSize={(v: string) => toggle(selectedSizes, setSelectedSizes, v)}
                  onClear={clearAll}
                />
              </div>
            </aside>

            <div>
              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-24 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary">
                    <Package className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">لا توجد منتجات تطابق البحث</h3>
                  <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                    جرّب تعديل الفلاتر أو مسحها لعرض جميع المنتجات المتاحة.
                  </p>
                  <button onClick={clearAll} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-button">
                    مسح الفلاتر
                  </button>
                </div>
              ) : (
                <>
                  <motion.div layout className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                      {pageItems.map((p: any) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          categoryName={getCategoryName(p.category_id)}
                          onPreview={setPreview}
                          onAddQuote={handleAddQuote}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground disabled:opacity-40 hover:bg-accent"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`h-10 min-w-[40px] rounded-lg px-3 text-sm font-bold transition-colors ${
                            page === i + 1
                              ? 'bg-primary text-primary-foreground shadow-button'
                              : 'border border-border bg-card text-foreground hover:bg-accent'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground disabled:opacity-40 hover:bg-accent"
                      >
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick preview dialog */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl overflow-hidden p-0">
          {preview && (
            <div className="grid sm:grid-cols-2">
              <div className="relative aspect-square sm:aspect-auto bg-accent/30">
                {preview.image_url ? (
                  <img src={preview.image_url} alt={preview.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground/30">
                    <Package className="h-16 w-16" strokeWidth={1.2} />
                  </div>
                )}
              </div>
              <div className="flex flex-col p-6">
                <div className="mb-2 flex items-center gap-2">
                  <AvailabilityBadge value={preview.availability || 'available'} />
                  {preview.brand && <span className="text-xs text-muted-foreground">· {preview.brand}</span>}
                </div>
                <h3 className="mb-1 text-xl font-extrabold text-foreground leading-snug">{preview.title}</h3>
                {preview.product_code && (
                  <p className="mb-3 text-xs text-muted-foreground" dir="ltr">#{preview.product_code}</p>
                )}
                {preview.description && (
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-4">{preview.description}</p>
                )}
                {Array.isArray(preview.specs) && preview.specs.length > 0 && (
                  <div className="mb-4 space-y-1.5 rounded-lg bg-accent/40 p-3 text-xs">
                    {preview.specs.slice(0, 4).map((s: any, i: number) => (
                      <div key={i} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-semibold text-foreground">{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex flex-col gap-2">
                  <button
                    onClick={() => { handleAddQuote(preview); setPreview(null); }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-button"
                  >
                    <Plus className="h-4 w-4" /> أضف إلى عرض السعر
                  </button>
                  <Link
                    to={`/product/${preview.slug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-bold text-foreground hover:bg-accent"
                    onClick={() => setPreview(null)}
                  >
                    عرض التفاصيل الكاملة <ChevronLeft className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CTA — didn't find what you need */}
      <section className="relative overflow-hidden bg-[hsl(var(--sherif-blue-deep))] py-16 lg:py-20">
        <div className="absolute inset-0 blueprint-grid opacity-[0.08]" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-primary-foreground tracking-tight">
              لم تجد ما تبحث عنه؟
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/80">
              فريقنا الهندسي جاهز لتوفير أي منتج أو مساعدتك في اختيار الحل المناسب لمشروعك — تواصل معنا الآن لعرض سعر مخصص.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/quote"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-6 py-3.5 text-sm font-extrabold text-primary shadow-hero transition-all hover:-translate-y-0.5"
              >
                <FileText className="h-4 w-4" /> اطلب عرض سعر
              </Link>
              <Link
                to="/#contact"
                className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/25 bg-primary-foreground/[0.06] backdrop-blur px-6 py-3.5 text-sm font-extrabold text-primary-foreground transition-all hover:bg-primary-foreground/[0.12]"
              >
                <MessageCircle className="h-4 w-4" /> تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductsPage;
