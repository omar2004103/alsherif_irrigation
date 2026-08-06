import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MessageCircle, ShoppingCart, Eye, X, ArrowRight, Search } from 'lucide-react';
import { useCategories, useProductsByCategory, useProductImages, getWhatsAppLink } from '@/hooks/useSupabaseData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';

const CategoryPage = () => {
  const { slug } = useParams();
  const { data: categories } = useCategories();
  const category = categories?.find(c => c.slug === slug);
  const { data: products, isLoading } = useProductsByCategory(category?.id || null);
  const [modalProduct, setModalProduct] = useState<any>(null);
  const [search, setSearch] = useState('');

  const filtered = products?.filter(p => p.title.includes(search) || p.description.includes(search)) || [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <div className="container py-10">
          <div className="mb-8 flex items-center gap-3 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ArrowRight className="h-3 w-3" />
            <Link to="/#categories" className="hover:text-primary transition-colors">الأقسام</Link>
            <ArrowRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">{category?.name}</span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">{category?.name}</h1>
          <p className="text-muted-foreground mb-8">جميع منتجات قسم {category?.name}</p>

          <div className="relative mb-8 max-w-md">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="ابحث في هذا القسم..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-input bg-card py-3 pr-10 pl-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {isLoading ? <p className="text-center py-12 text-muted-foreground">جاري التحميل...</p> : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(product => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="group rounded-2xl border border-border bg-card overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-500 flex flex-col h-full">
                  <div className="relative h-52 w-full overflow-hidden bg-gradient-to-tr from-accent/50 via-card to-accent/30 flex items-center justify-center p-4">
                    {product.image_url ? (
                      <>
                        <img src={product.image_url} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-20 blur-xl scale-125" />
                        <img src={product.image_url} alt={product.title} className="relative z-10 max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105" />
                      </>
                    ) : (
                      <p className="text-lg font-bold text-muted-foreground/30">{product.title}</p>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="mb-2 text-base font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">{product.title}</h3>
                    <p className="mb-4 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-2 border-t border-border/50">
                      <a href={getWhatsAppLink('201111661177', product.title)} target="_blank" rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground shadow-button hover:scale-[1.02] transition-transform">
                        <MessageCircle className="h-3.5 w-3.5" />واتساب
                      </a>
                      <button onClick={() => setModalProduct(product)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-accent transition-colors">
                        <Eye className="h-3.5 w-3.5" />معاينة
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {!isLoading && filtered.length === 0 && <p className="text-center py-12 text-muted-foreground">لا توجد منتجات في هذا القسم حالياً</p>}
        </div>
      </main>
      <Footer />
      <FloatingActions />

      <AnimatePresence>
        {modalProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4" onClick={() => setModalProduct(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card shadow-hero" onClick={e => e.stopPropagation()}>
              <div className="h-52 gradient-hero flex items-center justify-center overflow-hidden">
                {modalProduct.image_url ? <img src={modalProduct.image_url} alt={modalProduct.title} className="h-full w-full object-cover" /> :
                  <p className="text-2xl font-bold text-muted-foreground/30">{modalProduct.title}</p>}
              </div>
              <button onClick={() => setModalProduct(null)} className="absolute top-4 left-4 rounded-full bg-card/80 p-2 text-foreground hover:bg-card"><X className="h-5 w-5" /></button>
              <div className="p-6">
                <h3 className="mb-3 text-2xl font-bold text-foreground">{modalProduct.title}</h3>
                <p className="mb-6 leading-relaxed text-muted-foreground">{modalProduct.description}</p>
                <div className="flex flex-wrap gap-3">
                  <a href={getWhatsAppLink('201111661177', modalProduct.title)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-button hover:scale-105 transition-transform">
                    <MessageCircle className="h-4 w-4" />استفسر واتساب
                  </a>
                  <a href={getWhatsAppLink('201111661177', `طلب: ${modalProduct.title}`)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground hover:scale-105 transition-transform">
                    <ShoppingCart className="h-4 w-4" />اطلب الآن
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryPage;
