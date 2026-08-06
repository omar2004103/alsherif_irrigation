import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Edit, Trash2, Search, Star, Upload, X, Image as ImageIcon, 
  Check, Save, ArrowRight, CheckSquare, Layers, Tag, ShieldCheck,
  Building2, DollarSign, Package, Globe, Eye, Sparkles, Sliders
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts, useCategories, useBrands } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { uploadFileToSupabase } from '@/services/storageService';

const COMMON_SIZES = [
  '16 مم', '20 مم', '25 مم', '32 مم', '40 مم', '50 مم', '63 مم', '75 مم', '90 مم', '110 مم', '160 مم',
  '1/2 بوصة', '3/4 بوصة', '1 بوصة', '1.5 بوصة', '2 بوصة', '3 بوصة', '4 بوصة (DN100)', '6 بوصة'
];

const COMMON_FEATURES = [
  'مقاوم للصدأ', 'مقاوم للضغط العالي', 'تركيب سهل وسريع', 'مناسب لمياه الشرب',
  'عمر افتراضي طويل', 'سطح أملس لتقليل الاحتكاك', 'تحمل كيميائي ممتاز'
];

const AdminProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  // Form Mode
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  // Form Fields - Basic Data
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [brandName, setBrandName] = useState('DKV');
  const [modelNumber, setModelNumber] = useState('');
  const [productCode, setProductCode] = useState('');
  const [barcode, setBarcode] = useState('');

  // Description
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');

  // Images
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Specs & Sizes
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['20 مم', '25 مم', '32 مم', '110 مم']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [material, setMaterial] = useState('PVC');
  const [pressure, setPressure] = useState('16 بار');
  const [connectionType, setConnectionType] = useState('ملحوم / لاصق');
  const [sealMaterial, setSealMaterial] = useState('EPDM');
  const [temperature, setTemperature] = useState('0°C - 45°C');
  const [origin, setOrigin] = useState('تركيا');
  const [warranty, setWarranty] = useState('سنة واحدة');

  // Features Checklist
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'مقاوم للصدأ', 'مقاوم للضغط العالي', 'تركيب سهل وسريع', 'عمر افتراضي طويل'
  ]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  // Pricing & Stock
  const [costPrice, setCostPrice] = useState('1250.00');
  const [salePrice, setSalePrice] = useState('1750.00');
  const [wholesalePrice, setWholesalePrice] = useState('1600.00');
  const [vatPercent, setVatPercent] = useState('14');
  const [stockQuantity, setStockQuantity] = useState('25');
  const [minStock, setMinStock] = useState('5');
  const [warehouse, setWarehouse] = useState('المخزن الرئيسي');
  const [availability, setAvailability] = useState('available');

  // SEO & Display Options
  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [showOnSite, setShowOnSite] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [latestProducts, setLatestProducts] = useState(true);
  const [showInHero, setShowInHero] = useState(true);

  // Reset Form
  const resetForm = () => {
    setTitle('');
    setTitleEn('');
    setCategoryId('');
    setSubCategory('');
    setBrandName('DKV');
    setModelNumber('');
    setProductCode('');
    setBarcode('');
    setDescription('');
    setFullDescription('');
    setImageUrl('');
    setGalleryImages([]);
    setSelectedSizes(['20 مم', '25 مم', '32 مم', '110 مم']);
    setMaterial('PVC');
    setPressure('16 بار');
    setConnectionType('ملحوم / لاصق');
    setSealMaterial('EPDM');
    setTemperature('0°C - 45°C');
    setOrigin('تركيا');
    setWarranty('سنة واحدة');
    setSelectedFeatures(['مقاوم للصدأ', 'مقاوم للضغط العالي', 'تركيب سهل وسريع', 'عمر افتراضي طويل']);
    setCostPrice('1250.00');
    setSalePrice('1750.00');
    setWholesalePrice('1600.00');
    setVatPercent('14');
    setStockQuantity('25');
    setMinStock('5');
    setWarehouse('المخزن الرئيسي');
    setAvailability('available');
    setSlug('');
    setMetaTitle('');
    setMetaDescription('');
    setShowOnSite(true);
    setFeatured(false);
    setLatestProducts(true);
    setShowInHero(true);
    setEditingProduct(null);
  };

  // Open Form for Editing
  const handleEdit = (p: any) => {
    setEditingProduct(p);
    setTitle(p.title || '');
    setTitleEn(p.title_en || '');
    setCategoryId(p.category_id || p.categoryId || '');
    setSubCategory(p.subcategory || '');
    setBrandName(p.brand || 'DKV');
    setModelNumber(p.model_number || '');
    setProductCode(p.product_code || '');
    setBarcode(p.barcode || '');
    setDescription(p.description || '');
    setFullDescription(p.full_description || p.description || '');
    setImageUrl(p.image_url || '');
    setSelectedSizes(Array.isArray(p.sizes) ? p.sizes : DEFAULT_SIZES_FALLBACK(p));
    setMaterial(p.material || 'PVC');
    setPressure(p.pressure || '16 بار');
    setConnectionType(p.connection_type || 'ملحوم / لاصق');
    setSealMaterial(p.seal_material || 'EPDM');
    setTemperature(p.temperature || '0°C - 45°C');
    setOrigin(p.origin || 'تركيا');
    setWarranty(p.warranty || 'سنة واحدة');
    setSelectedFeatures(Array.isArray(p.features) ? p.features.map((f: any) => typeof f === 'string' ? f : f.title) : []);
    setCostPrice(p.cost_price ? String(p.cost_price) : '1250.00');
    setSalePrice(p.sale_price ? String(p.sale_price) : '1750.00');
    setWholesalePrice(p.wholesale_price ? String(p.wholesale_price) : '1600.00');
    setVatPercent(p.vat_percent ? String(p.vat_percent) : '14');
    setStockQuantity(p.stock_quantity ? String(p.stock_quantity) : '25');
    setMinStock(p.min_stock ? String(p.min_stock) : '5');
    setWarehouse(p.warehouse || 'المخزن الرئيسي');
    setAvailability(p.availability || 'available');
    setSlug(p.slug || '');
    setMetaTitle(p.meta_title || '');
    setMetaDescription(p.meta_description || '');
    setShowOnSite(p.show_on_site !== false);
    setFeatured(Boolean(p.featured || p.is_featured));
    setLatestProducts(p.latest_products !== false);
    setShowInHero(p.show_in_hero !== false);

    setShowForm(true);
  };

  function DEFAULT_SIZES_FALLBACK(p: any) {
    if (p.specs_size) return [p.specs_size];
    return ['20 مم', '25 مم', '32 مم', '110 مم'];
  }

  // Upload Handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const { url } = await uploadFileToSupabase(file, 'products');
      setImageUrl(url);
      if (!galleryImages.includes(url)) {
        setGalleryImages(prev => [url, ...prev]);
      }
      toast({ title: 'تم رفع الصورة بنجاح 🖼️' });
    } catch (err: any) {
      toast({ title: 'خطأ أثناء رفع الصورة', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const { url } = await uploadFileToSupabase(file, 'products');
        uploaded.push(url);
      }
      setGalleryImages(prev => [...prev, ...uploaded]);
      if (!imageUrl && uploaded.length > 0) setImageUrl(uploaded[0]);
      toast({ title: `تم رفع ${uploaded.length} صور إلى معرض المنتج 🖼️` });
    } catch (err: any) {
      toast({ title: 'خطأ أثناء رفع المعرض', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  // Toggle Size selection
  const toggleSize = (sz: string) => {
    setSelectedSizes(prev => prev.includes(sz) ? prev.filter(x => x !== sz) : [...prev, sz]);
  };

  const addCustomSize = () => {
    if (!customSizeInput.trim()) return;
    if (!selectedSizes.includes(customSizeInput.trim())) {
      setSelectedSizes(prev => [...prev, customSizeInput.trim()]);
    }
    setCustomSizeInput('');
  };

  // Toggle Feature selection
  const toggleFeature = (feat: string) => {
    setSelectedFeatures(prev => prev.includes(feat) ? prev.filter(x => x !== feat) : [...prev, feat]);
  };

  const addCustomFeature = () => {
    if (!customFeatureInput.trim()) return;
    if (!selectedFeatures.includes(customFeatureInput.trim())) {
      setSelectedFeatures(prev => [...prev, customFeatureInput.trim()]);
    }
    setCustomFeatureInput('');
  };

  // Save Product (Insert or Update)
  const handleSave = async (andCreateNew = false) => {
    if (!title.trim()) {
      toast({ title: 'تنبيه', description: 'يرجى كتابة اسم المنتج بالعربي', variant: 'destructive' });
      return;
    }

    const generatedSlug = slug.trim() || title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]/g, '');

    const payload: any = {
      title: title.trim(),
      title_en: titleEn.trim() || null,
      slug: generatedSlug,
      description: description.trim() || title.trim(),
      full_description: fullDescription.trim() || description.trim(),
      category_id: categoryId || null,
      subcategory: subCategory.trim() || null,
      brand: brandName.trim() || 'ERA',
      model_number: modelNumber.trim() || null,
      product_code: productCode.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: barcode.trim() || null,
      image_url: imageUrl || (galleryImages[0] || null),
      sizes: selectedSizes,
      material: material,
      pressure: pressure,
      connection_type: connectionType,
      seal_material: sealMaterial,
      temperature: temperature,
      origin: origin,
      warranty: warranty,
      features: selectedFeatures.map(f => ({ title: f })),
      cost_price: parseFloat(costPrice) || 0,
      sale_price: parseFloat(salePrice) || 0,
      wholesale_price: parseFloat(wholesalePrice) || 0,
      vat_percent: parseFloat(vatPercent) || 14,
      stock_quantity: parseInt(stockQuantity, 10) || 0,
      min_stock: parseInt(minStock, 10) || 5,
      warehouse: warehouse,
      availability: availability,
      meta_title: metaTitle.trim() || title.trim(),
      meta_description: metaDescription.trim() || description.trim(),
      show_on_site: showOnSite,
      featured: featured,
      latest_products: latestProducts,
      show_in_hero: showInHero,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
        toast({ title: 'تم تحديث البيانات بنجاح ✨' });
      } else {
        const { data, error } = await supabase.from('products').insert([payload]).select().single();
        if (error) throw error;

        // Insert gallery images if any
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

      queryClient.invalidateQueries({ queryKey: ['products'] });

      if (andCreateNew) {
        resetForm();
        setShowForm(true);
      } else {
        setShowForm(false);
        resetForm();
      }
    } catch (err: any) {
      console.error('Save Product Error:', err);
      toast({ title: 'خطأ في الحفظ', description: err.message, variant: 'destructive' });
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت تأكد من رغبتك في حذف هذا المنتج؟')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'تم الحذف بنجاح 🗑️' });
    } catch (err: any) {
      toast({ title: 'خطأ في الحذف', description: err.message, variant: 'destructive' });
    }
  };

  const filteredProducts = products?.filter((p: any) => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCat || p.category_id === selectedCat;
    const matchBrand = !selectedBrand || p.brand === selectedBrand;
    return matchSearch && matchCat && matchBrand;
  }) || [];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* View 1: Add/Edit Product Full Page Form (Matching Screenshot) */}
      {showForm ? (
        <div className="space-y-6">
          {/* Top Form Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowForm(false)} className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                <ArrowRight className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-xl font-black text-foreground">
                  {editingProduct ? 'تعديل البيانات' : 'إضافة منتج جديد'}
                </h1>
                <p className="text-xs text-muted-foreground">الرئيسية / المنتجات / {editingProduct ? 'تعديل' : 'إضافة منتج'}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSave(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
              >
                <Save className="h-4 w-4" /> حفظ المنتج
              </button>

              <button
                onClick={() => handleSave(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 text-emerald-600 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all"
              >
                <Plus className="h-4 w-4" /> حفظ وإضافة جديد
              </button>

              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 text-rose-600 bg-rose-50 px-4 py-2.5 text-xs font-bold hover:bg-rose-600 hover:text-white transition-all"
              >
                <X className="h-4 w-4" /> إلغاء
              </button>
            </div>
          </div>

          {/* Cards Grid Container */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Left Column: Product Images + Pricing + Inventory */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* Card 1: صور المنتج (Product Images) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <ImageIcon className="h-4 w-4" /> صور المنتج
                  </div>
                  <span className="text-[11px] text-muted-foreground">يمكنك رفع حتى 10 صور للمنتج</span>
                </div>

                {/* Dropzone */}
                <div className="relative rounded-2xl border-2 border-dashed border-border bg-accent/20 p-6 text-center hover:border-primary/50 transition-colors">
                  <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Upload className="mx-auto h-8 w-8 text-primary/70 mb-2" />
                  <p className="text-xs font-bold text-foreground">اضغط لرفع الصور</p>
                  <p className="text-[10px] text-muted-foreground mt-1">أو اسحب الصور وأفلتها هنا (الحد الأقصى 5 ميجابايت JPG, PNG)</p>
                </div>

                {/* Image Thumbnails Grid */}
                <div className="grid grid-cols-4 gap-2.5">
                  {galleryImages.map((img, i) => (
                    <div key={i} className={`group relative aspect-square rounded-xl border overflow-hidden bg-card p-1 ${imageUrl === img ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-border'}`}>
                      <img src={img} alt="" className="h-full w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                        className="absolute top-1 left-1 rounded-full bg-rose-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl(img)}
                        className={`absolute bottom-1 right-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${imageUrl === img ? 'bg-emerald-600 text-white' : 'bg-black/60 text-white opacity-0 group-hover:opacity-100'}`}
                      >
                        رئيسية
                      </button>
                    </div>
                  ))}
                  <label htmlFor="add-single-img" className="aspect-square rounded-xl border border-dashed border-border bg-accent/30 hover:bg-accent flex flex-col items-center justify-center cursor-pointer text-muted-foreground text-xs font-bold gap-1">
                    <Plus className="h-5 w-5" />
                    <span>إضافة صورة</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} id="add-single-img" className="hidden" />
                  </label>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">* اسحب الصور لترتيبها</p>
              </div>

              {/* Card 2: الأسعار (Pricing) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm border-b border-border/50 pb-3">
                  <DollarSign className="h-4 w-4" /> الأسعار
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">سعر الشراء (ج.م)</label>
                    <input type="text" value={costPrice} onChange={e => setCostPrice(e.target.value)} className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-mono outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">سعر البيع (ج.م) *</label>
                    <input type="text" value={salePrice} onChange={e => setSalePrice(e.target.value)} className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-mono outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">سعر الجملة (ج.م)</label>
                    <input type="text" value={wholesalePrice} onChange={e => setWholesalePrice(e.target.value)} className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-mono outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">الضريبة (%)</label>
                    <input type="text" value={vatPercent} onChange={e => setVatPercent(e.target.value)} className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-mono outline-none focus:border-primary" />
                  </div>
                </div>
              </div>

              {/* Card 3: المخزون (Inventory) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm border-b border-border/50 pb-3">
                  <Package className="h-4 w-4" /> المخزون
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">الكمية المتوفرة *</label>
                    <input type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-mono outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">الحد الأدنى للمخزون</label>
                    <input type="number" value={minStock} onChange={e => setMinStock(e.target.value)} className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-mono outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">المخزن</label>
                    <select value={warehouse} onChange={e => setWarehouse(e.target.value)} className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none">
                      <option value="المخزن الرئيسي">المخزن الرئيسي</option>
                      <option value="فرع النوبارية">فرع النوبارية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">حالة المنتج *</label>
                    <select value={availability} onChange={e => setAvailability(e.target.value)} className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-bold text-emerald-600 outline-none">
                      <option value="available">متوفر</option>
                      <option value="on_request">عند الطلب</option>
                      <option value="out_of_stock">غير متوفر</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Middle & Right Column: Basic Data + Descriptions + Specs + SEO */}
            <div className="space-y-6 lg:col-span-2">
              
              {/* Card 4: البيانات الأساسية (Basic Info) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-border/50 pb-3">
                  <Tag className="h-4 w-4" /> البيانات الأساسية
                </div>
                
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">اسم المنتج بالعربي *</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: صمام فراشة (DKV) PVC 4 إنش" className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">الاسم بالإنجليزي</label>
                    <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="DKV PVC Butterfly Valve 4 Inch" className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary" dir="ltr" />
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">التصنيف الرئيسي *</label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary">
                      <option value="">اختر القسم</option>
                      {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">التصنيف الفرعي</label>
                    <input type="text" value={subCategory} onChange={e => setSubCategory(e.target.value)} placeholder="صمامات فراشة" className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary" />
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">الماركة *</label>
                    <select value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary">
                      <option value="DKV">DKV</option>
                      <option value="ERA">ERA</option>
                      <option value="AZUD">AZUD</option>
                      <option value="NETAFIM">NETAFIM</option>
                      <option value="PLASSON">PLASSON</option>
                      <option value="Rivulis">Rivulis</option>
                      <option value="ASTORE">ASTORE</option>
                      {brands?.map((b: any) => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">رقم الموديل</label>
                    <input type="text" value={modelNumber} onChange={e => setModelNumber(e.target.value)} placeholder="DKV-BV-PVC-4" className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary" dir="ltr" />
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">SKU / كود المنتج *</label>
                    <input type="text" value={productCode} onChange={e => setProductCode(e.target.value)} placeholder="DKV-PVC-BV-4IN" className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary font-mono" dir="ltr" />
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">الباركود</label>
                    <input type="text" value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="6921109012345" className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary font-mono" dir="ltr" />
                  </div>
                </div>
              </div>

              {/* Card 5: الوصف (Descriptions) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-border/50 pb-3">
                  <FileText className="h-4 w-4" /> الوصف والتفاصيل
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-bold text-foreground">وصف مختصر *</label>
                      <span className="text-muted-foreground text-[10px]">{description.length}/300</span>
                    </div>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} maxLength={300} placeholder="اكتب وصفاً موجزاً يظهر في كارت المنتج..." className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary resize-none" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-bold text-foreground">الوصف الكامل والمواصفات الشاملة</label>
                      <span className="text-muted-foreground text-[10px]">{fullDescription.length}/2000</span>
                    </div>
                    <textarea value={fullDescription} onChange={e => setFullDescription(e.target.value)} rows={4} maxLength={2000} placeholder="اكتب التفاصيل الكاملة واستخدامات المنتج..." className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary resize-none" />
                  </div>
                </div>
              </div>

              {/* Card 6: المواصفات والمقاسات (Specs & Sizes Selector) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <Sliders className="h-4 w-4" /> المواصفات والمقاسات
                  </div>
                  <span className="text-[11px] text-muted-foreground">اختر المقاسات المتاحة لهذا المنتج</span>
                </div>

                {/* Sizes Selector Pills */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground">المقاسات المتاحة (* انقر للتفعيل):</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SIZES.map(sz => {
                      const isSelected = selectedSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => toggleSize(sz)}
                          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border ${
                            isSelected ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 ring-2 ring-emerald-500/20' : 'border-border bg-accent/20 text-muted-foreground hover:bg-accent'
                          }`}
                        >
                          {sz} {isSelected ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Size */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={customSizeInput}
                      onChange={e => setCustomSizeInput(e.target.value)}
                      placeholder="إضافة مقاس مخصص (مثال: 80 مم أو 5 بوصة)..."
                      className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs outline-none flex-1"
                    />
                    <button type="button" onClick={addCustomSize} className="rounded-xl bg-accent border border-border px-4 py-1.5 text-xs font-bold text-foreground hover:bg-primary hover:text-white">
                      + إضافة مقاس
                    </button>
                  </div>
                </div>

                {/* Specs Selectors */}
                <div className="grid gap-3 sm:grid-cols-4 text-xs pt-2">
                  <div>
                    <label className="block font-bold text-foreground mb-1">الخامة</label>
                    <select value={material} onChange={e => setMaterial(e.target.value)} className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none">
                      <option value="PVC">PVC</option>
                      <option value="UPVC">UPVC</option>
                      <option value="HDPE">HDPE</option>
                      <option value="PP">PP</option>
                      <option value="معدن">معدن</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">ضغط التشغيل</label>
                    <select value={pressure} onChange={e => setPressure(e.target.value)} className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none">
                      <option value="16 بار">16 بار (200 PSI)</option>
                      <option value="10 بار">10 بار</option>
                      <option value="6 بار">6 بار</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">نوع التوصيل</label>
                    <select value={connectionType} onChange={e => setConnectionType(e.target.value)} className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none">
                      <option value="ملحوم / لاصق">ملحوم / لاصق</option>
                      <option value="(فلانشة) Flange">(فلانشة) Flange</option>
                      <option value="قلاووظ / سن">قلاووظ / سن</option>
                      <option value="وصلة compression">وصلة compression</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">بلد المنشأ</label>
                    <select value={origin} onChange={e => setOrigin(e.target.value)} className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none">
                      <option value="تركيا">تركيا</option>
                      <option value="مصر">مصر</option>
                      <option value="الصين">الصين</option>
                      <option value="إسبانيا">إسبانيا</option>
                      <option value="إيطاليا">إيطاليا</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 7: مميزات المنتج (Features Checklist) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-sm border-b border-border/50 pb-3">
                  <Sparkles className="h-4 w-4" /> مميزات المنتج
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {COMMON_FEATURES.map(feat => {
                    const isChecked = selectedFeatures.includes(feat);
                    return (
                      <label key={feat} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${isChecked ? 'border-purple-500 bg-purple-500/10 font-bold text-purple-700' : 'border-border bg-accent/20 text-muted-foreground'}`}>
                        <input type="checkbox" checked={isChecked} onChange={() => toggleFeature(feat)} className="rounded text-purple-600" />
                        <span>{feat}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input type="text" value={customFeatureInput} onChange={e => setCustomFeatureInput(e.target.value)} placeholder="إضافة ميزة مخصصة..." className="rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none flex-1" />
                  <button type="button" onClick={addCustomFeature} className="rounded-xl bg-accent border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-purple-600 hover:text-white">
                    + إضافة ميزة
                  </button>
                </div>
              </div>

              {/* Card 8: SEO + خيارات العرض (SEO & Display Options) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-sky-600 font-bold text-sm border-b border-border/50 pb-3">
                  <Globe className="h-4 w-4" /> تحسين البحث (SEO) وخيارات العرض
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">رابط المنتج (Slug)</label>
                    <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="dkv-pvc-butterfly-valve-4-inch" className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none font-mono" dir="ltr" />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">عنوان الصفحة (SEO Title)</label>
                    <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="عنوان الصفحة محرك البحث..." className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none" />
                  </div>
                </div>

                {/* Display Options Checkboxes */}
                <div className="border-t border-border/50 pt-3">
                  <label className="block font-bold text-foreground mb-2 text-xs">خيارات العرض في الموقع:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={showOnSite} onChange={e => setShowOnSite(e.target.checked)} className="rounded" />
                      <span>يظهر في الموقع</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-600">
                      <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="rounded text-amber-500" />
                      <span>★ منتج مميز</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={latestProducts} onChange={e => setLatestProducts(e.target.checked)} className="rounded" />
                      <span>أحدث المنتجات</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={showInHero} onChange={e => setShowInHero(e.target.checked)} className="rounded" />
                      <span>يظهر في الرئيسية</span>
                    </label>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (

        /* View 2: Products List Table */
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-foreground">إدارة المنتجات والمخزون</h1>
              <p className="text-xs text-muted-foreground mt-1">إضافة، تعديل، وحذف منتجات وتوريدات الري الزراعي</p>
            </div>

            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-primary-foreground shadow-lg hover:scale-[1.02] transition-all"
            >
              <Plus className="h-4 w-4" /> إضافة منتج جديد
            </button>
          </div>

          {/* Filters Bar */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="ابحث باسم المنتج أو الكود..."
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
                <option value="DKV">DKV</option>
                <option value="ERA">ERA</option>
                <option value="AZUD">AZUD</option>
                <option value="NETAFIM">NETAFIM</option>
                <option value="PLASSON">PLASSON</option>
                {brands?.map((b: any) => <option key={b.id} value={b.name}>{b.name}</option>)}
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
                    <th className="p-3.5">القسم والماركة</th>
                    <th className="p-3.5">المقاسات المتاحة</th>
                    <th className="p-3.5">حالة التوفر</th>
                    <th className="p-3.5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">جاري تحميل المنتجات...</td></tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد منتجات مطابقة للبحث</td></tr>
                  ) : (
                    filteredProducts.map((p: any) => {
                      const categoryName = categories?.find((c: any) => c.id === (p.category_id || p.categoryId))?.name || 'عام';
                      const isProdFeatured = Boolean(p.featured || p.is_featured);
                      const prodSizes = Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.specs_size || 'متعدد');

                      return (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 shrink-0 rounded-xl border border-border bg-muted overflow-hidden flex items-center justify-center p-1">
                                {p.image_url ? (
                                  <img src={p.image_url} alt={p.title} className="max-h-full max-w-full object-contain" />
                                ) : (
                                  <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-foreground">{p.title}</span>
                                  {isProdFeatured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" title="منتج مميز" />}
                                </div>
                                <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5" dir="ltr">
                                  #{p.product_code || `SKU-${p.id.slice(0, 6)}`}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-medium text-foreground">{categoryName}</div>
                            <span className="text-[10px] text-primary font-bold">{p.brand || 'ERA'}</span>
                          </td>

                          <td className="p-3.5">
                            <span className="inline-block rounded-lg bg-accent/40 px-2 py-1 text-[10px] font-bold text-foreground max-w-[150px] truncate" dir="ltr">
                              {prodSizes}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              p.availability === 'available' || !p.availability ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {p.availability === 'available' || !p.availability ? '• متوفر في المخزون' : '• متوفر عند الطلب'}
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
        </>
      )}

    </div>
  );
};

export default AdminProducts;
