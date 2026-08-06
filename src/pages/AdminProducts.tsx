import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Edit, Trash2, Search, Star, Upload, X, Image as ImageIcon, 
  Filter, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts, useCategories, useBrands } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { uploadFileToSupabase } from '@/services/storageService';

const AdminProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [availability, setAvailability] = useState('available');

  // Additional Gallery Images
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Reset Form
  const resetForm = () => {
    setTitle('');
    setSlug('');
    setDescription('');
    setCategoryId('');
    setBrandId('');
    setImageUrl('');
    setFeatured(false);
    setAvailability('available');
    setGalleryImages([]);
    setEditingProduct(null);
  };

  // Open Edit Form
  const handleEdit = (p: any) => {
    setEditingProduct(p);
    setTitle(p.title || '');
    setSlug(p.slug || '');
    setDescription(p.description || '');
    setCategoryId(p.category_id || p.categoryId || '');
    setBrandId(p.brand_id || p.brandId || '');
    setImageUrl(p.image_url || '');
    setFeatured(Boolean(p.featured || p.is_featured));
    setAvailability(p.availability || 'available');
    setShowModal(true);
  };

  // Main Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const { url } = await uploadFileToSupabase(file, 'products');
      setImageUrl(url);
      toast({ title: 'تم رفع الصورة بنجاح 🖼️' });
    } catch (err: any) {
      console.error('Image Upload Error:', err);
      toast({ title: 'خطأ أثناء رفع الصورة', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  // Gallery Multiple Images Upload Handler
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const { url } = await uploadFileToSupabase(file, 'products');
        uploadedUrls.push(url);
      }
      setGalleryImages(prev => [...prev, ...uploadedUrls]);
      toast({ title: `تم رفع ${uploadedUrls.length} صور إلى المعرض 🖼️` });
    } catch (err: any) {
      console.error('Gallery Upload Error:', err);
      toast({ title: 'خطأ أثناء رفع الصور', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  // Save Product (Create or Update)
  const handleSave = async () => {
    // Robust Form Validation
    if (!title.trim()) {
      toast({ title: 'تنبيه', description: 'يرجى إدخال اسم المنتج', variant: 'destructive' });
      return;
    }

    const generatedSlug = slug.trim() || title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]/g, '');

    const payload: any = {
      title: title.trim(),
      slug: generatedSlug,
      description: description.trim() || title.trim(),
      category_id: categoryId || null,
      brand_id: brandId || null,
      featured: featured,
      image_url: imageUrl || null,
      availability: availability,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingProduct) {
        // Update Product
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: 'تم تحديث المنتج بنجاح ✨' });
      } else {
        // Create Product
        const { data, error } = await supabase
          .from('products')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;

        // Insert additional gallery images if present
        if (data?.id && galleryImages.length > 0) {
          const imageRows = galleryImages.map((url, idx) => ({
            product_id: data.id,
            image_url: url,
            is_primary: idx === 0,
          }));
          await supabase.from('product_images').insert(imageRows);
        }

        toast({ title: 'تم إضافة المنتج بنجاح 🎉' });
      }

      // Refresh Data
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Save Product Error:', err);
      toast({ 
        title: 'خطأ أثناء حفظ المنتج', 
        description: err.message || 'تعذر حفظ البيانات في قاعدة البيانات', 
        variant: 'destructive' 
      });
    }
  };

  // Delete Product Handler
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت تأكد من رغبتك في حذف هذا المنتج نهائياً؟')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'تم حذف المنتج بنجاح 🗑️' });
    } catch (err: any) {
      console.error('Delete Product Error:', err);
      toast({ title: 'خطأ في الحذف', description: err.message, variant: 'destructive' });
    }
  };

  // Filtered Products
  const filteredProducts = products?.filter((p: any) => {
    const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCat || p.category_id === selectedCat || p.categoryId === selectedCat;
    const matchesBrand = !selectedBrand || p.brand_id === selectedBrand || p.brandId === selectedBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  }) || [];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">إدارة المنتجات والمخزون</h1>
          <p className="text-xs text-muted-foreground mt-1">إضافة، تعديل، وحذف منتجات وتوريدات الري الزراعي</p>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-primary-foreground shadow-lg hover:scale-[1.02] transition-all"
        >
          <Plus className="h-4 w-4" /> إضافة منتج جديد
        </button>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-input bg-background py-2.5 pr-9 pl-4 text-xs outline-none focus:border-primary"
            />
          </div>

          <select
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
            className="rounded-xl border border-input bg-background py-2.5 px-3 text-xs outline-none focus:border-primary"
          >
            <option value="">جميع الأقسام</option>
            {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select
            value={selectedBrand}
            onChange={e => setSelectedBrand(e.target.value)}
            className="rounded-xl border border-input bg-background py-2.5 px-3 text-xs outline-none focus:border-primary"
          >
            <option value="">جميع الماركات</option>
            {brands?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
                <th className="p-3.5">الصورة والمنتج</th>
                <th className="p-3.5">القسم</th>
                <th className="p-3.5">الحالة والتألق</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">جاري تحميل المنتجات...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">لا توجد منتجات مطابقة للبحث</td></tr>
              ) : (
                filteredProducts.map((p: any) => {
                  const categoryName = categories?.find((c: any) => c.id === (p.category_id || p.categoryId))?.name || 'عام';
                  const isProdFeatured = Boolean(p.featured || p.is_featured);

                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 rounded-xl border border-border bg-muted overflow-hidden flex items-center justify-center">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-foreground">{p.title}</span>
                              {isProdFeatured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{p.description}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-medium text-foreground">{categoryName}</span>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          p.availability === 'available' || !p.availability ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {p.availability === 'available' || !p.availability ? 'متوفر' : 'غير متوفر'}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(p)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground" title="تعديل">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" title="حذف">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-black text-foreground">{editingProduct ? `تعديل: ${editingProduct.title}` : 'إضافة منتج جديد'}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-full p-1.5 text-muted-foreground hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 text-xs sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-bold text-foreground">اسم المنتج *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: طلمبة غاطسة 5 حصان"
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-foreground">القسم *</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:border-primary"
                >
                  <option value="">اختر القسم</option>
                  {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block font-bold text-foreground">الوصف *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="اكتب مواصفات المنتج..."
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="block font-bold text-foreground">الصورة الرئيسية للمنتج (High-Res Image)</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="prod-main-img-file" />
                  <label htmlFor="prod-main-img-file" className="cursor-pointer rounded-xl bg-primary px-5 py-3 text-white font-bold flex items-center justify-center gap-2 shrink-0 shadow-md hover:bg-primary/90 transition-all">
                    <Upload className="h-4 w-4" /> {uploading ? 'جاري رفع المعالجة...' : 'رفع صورة فائقة الجودة'}
                  </label>
                  <input
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="أو ضع رابط الصورة المباشر..."
                    className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary"
                    dir="ltr"
                  />
                </div>
                {imageUrl && (
                  <div className="mt-3 flex items-center gap-4 rounded-2xl border border-border bg-accent/30 p-3">
                    <div className="relative h-24 w-24 rounded-xl border border-border/80 bg-card p-1.5 overflow-hidden flex items-center justify-center shadow-inner shrink-0">
                      <img src={imageUrl} alt="Main Preview" className="max-h-full max-w-full object-contain rounded-lg drop-shadow" />
                    </div>
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">✓ معتمدة للعرض النقائي</span>
                      <p className="text-muted-foreground text-[11px]">سيتم عرض هذه الصورة بأعلى دقة ووضوح وبدون أي تشويه أو اقتطاع.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="block font-bold text-foreground">معرض صور إضافية للمنتج (Multiple Gallery Images)</label>
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" id="prod-gallery-imgs-file" />
                  <label htmlFor="prod-gallery-imgs-file" className="cursor-pointer rounded-xl border border-border bg-accent hover:bg-accent/80 px-5 py-3 font-bold flex items-center gap-2 shrink-0 transition-colors">
                    <Upload className="h-4 w-4 text-primary" /> {uploading ? 'جاري الرفع...' : '+ رفع مجموعة صور إضافية'}
                  </label>
                </div>
                {galleryImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {galleryImages.map((img, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl border border-border bg-card p-1 overflow-hidden flex items-center justify-center shadow-sm">
                        <img src={img} alt="" className="max-h-full max-w-full object-contain rounded" />
                        <button
                          type="button"
                          onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                          className="absolute top-1 left-1 rounded-full bg-rose-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          title="حذف الصورة"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} id="featured-check" className="rounded" />
                <label htmlFor="featured-check" className="font-bold text-foreground cursor-pointer">منتج مميز (Featured)</label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <button onClick={() => setShowModal(false)} className="rounded-xl border border-border px-5 py-2.5 font-bold text-xs hover:bg-accent">
                إلغاء
              </button>
              <button onClick={handleSave} className="rounded-xl bg-primary px-6 py-2.5 font-bold text-xs text-primary-foreground shadow-lg hover:scale-105 transition-all">
                {editingProduct ? 'تحديث المنتج' : 'حفظ المنتج'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
