import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageCircle, ShoppingCart, Eye, X, Filter } from 'lucide-react';
import { useProducts, useCategories, useProductImages, getWhatsAppLink } from '@/hooks/useSupabaseData';

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string | null;
  image_url: string | null;
  featured: boolean;
  created_at: string;
};

const ProductCard = forwardRef<HTMLDivElement, { product: Product; categoryName?: string; onDetails: (p: Product) => void }>(
  ({ product, categoryName, onDetails }, ref) => {
    const badgeTag = (product as any).badge_tag || (product.featured ? 'الأكثر مبيعاً' : null);

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group rounded-2xl border border-border/80 bg-card overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 flex flex-col h-full"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-muted/20 to-card p-4 flex items-center justify-center border-b border-border/40">
          <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-500/20">
              • متوفر
            </span>
            {badgeTag && (
              <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm ${
                badgeTag === 'خصم' ? 'bg-rose-600' : badgeTag === 'جديد' ? 'bg-sky-600' : 'bg-amber-500'
              }`}>
                {badgeTag}
              </span>
            )}
          </div>

          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="relative z-0 max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-108" />
          ) : (
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-bold opacity-40">{product.title}</p>
            </div>
          )}

          {(product as any).brand && (
            <div className="absolute bottom-2.5 right-3 z-10 font-black text-xs tracking-tight text-primary/90 bg-card/90 backdrop-blur-sm px-2 py-0.5 rounded border border-border/40 shadow-xs">
              {(product as any).brand}
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1 text-right">
          <h3 className="mb-1 text-base font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">{product.title}</h3>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground line-clamp-1">{product.description || (categoryName ? `قسم ${categoryName}` : 'مواصفات ممتازة لنظم الري')}</p>
          
          <div className="mt-auto grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
            <button onClick={() => onDetails(product)}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-2.5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-accent hover:text-primary">
              عرض التفاصيل
            </button>
            <a href={getWhatsAppLink('201111661177', `طلب عرض سعر: ${product.title}`)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-primary/30 bg-primary/10 px-2.5 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
              طلب عرض سعر
            </a>
          </div>
        </div>
      </motion.div>
    );
  }
);
ProductCard.displayName = 'ProductCard';

const ProductModal = forwardRef<HTMLDivElement, { product: Product; categoryName?: string; onClose: () => void }>(
  ({ product, categoryName, onClose }, ref) => {
    const { data: images } = useProductImages(product.id);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card shadow-hero"
          onClick={e => e.stopPropagation()}
        >
          <div className="h-52 gradient-hero flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <p className="text-2xl font-bold text-muted-foreground/30">{product.title}</p>
            )}
          </div>
          <button onClick={onClose} className="absolute top-4 left-4 rounded-full bg-card/80 p-2 text-foreground hover:bg-card">
            <X className="h-5 w-5" />
          </button>
          <div className="p-6">
            {categoryName && <span className="mb-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{categoryName}</span>}
            <h3 className="mb-3 text-2xl font-bold text-foreground">{product.title}</h3>
            <p className="mb-4 leading-relaxed text-muted-foreground">{product.description}</p>
            {images && images.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-2">
                {images.map(img => (
                  <img key={img.id} src={img.image_url} alt="" className="rounded-lg h-20 w-full object-cover" />
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <a href={getWhatsAppLink('201111661177', product.title)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-button transition-transform hover:scale-105">
                <MessageCircle className="h-4 w-4" />استفسر واتساب
              </a>
              <a href={getWhatsAppLink('201111661177', `طلب: ${product.title}`)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground transition-transform hover:scale-105">
                <ShoppingCart className="h-4 w-4" />اطلب الآن
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }
);
ProductModal.displayName = 'ProductModal';

const ProductsSection = () => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();

  const filtered = products?.filter(p => {
    const matchSearch = p.title.includes(search) || p.description.includes(search);
    const matchCat = !selectedCat || p.category_id === selectedCat;
    return matchSearch && matchCat;
  }) || [];

  const getCatName = (catId: string | null) => categories?.find(c => c.id === catId)?.name;

  return (
    <section id="products" className="py-20 bg-muted/30">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <span className="mb-3 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">منتجاتنا</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">تشكيلة واسعة من منتجات الري</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">اكتشف مجموعتنا المتكاملة من معدات ومستلزمات الري الحديث</p>
        </motion.div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="ابحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-input bg-card py-3 pr-10 pl-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button onClick={() => setSelectedCat(null)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors ${!selectedCat ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-accent'}`}>
              <Filter className="ml-1 inline h-3 w-3" />الكل
            </button>
            {categories?.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors ${selectedCat === cat.id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-accent'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {productsLoading ? (
          <p className="text-center py-12 text-muted-foreground">جاري التحميل...</p>
        ) : (
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} categoryName={getCatName(product.category_id) || undefined} onDetails={setModalProduct} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!productsLoading && filtered.length === 0 && (
          <p className="text-center py-12 text-muted-foreground">لا توجد منتجات مطابقة للبحث</p>
        )}
      </div>
      <AnimatePresence>
        {modalProduct && <ProductModal product={modalProduct} categoryName={getCatName(modalProduct.category_id) || undefined} onClose={() => setModalProduct(null)} />}
      </AnimatePresence>
    </section>
  );
};

export default ProductsSection;
