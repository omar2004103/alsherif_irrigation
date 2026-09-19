import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Edit, Trash2, Search, Star, Upload, X, Image as ImageIcon, 
  Check, Save, ArrowRight, CheckSquare, Layers, Tag, ShieldCheck,
  Building2, DollarSign, Package, Globe, Eye, Sparkles, Sliders, FileText, FileDown,
  ListPlus, ToggleLeft, ToggleRight, CheckCircle2, Info, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts, useCategories, useBrands } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { uploadFileToSupabase } from '@/services/storageService';

const COMMON_SIZES = [
  '16 مم', '20 مم', '25 مم', '32 مم', '40 مم', '50 مم', '63 مم', '75 مم', '90 مم', '110 مم', '160 مم',
  '1/2 بوصة', '3/4 بوصة', '1 بوصة', '1.5 بوصة', '2 بوصة', '3 بوصة', '4 بوصة (DN100)', '6 بوصة'
];

const COMMON_PRESSURES = ['6 بار', '10 بار', '16 بار', '20 بار', '25 بار'];

const COMMON_FEATURES = [
  'مقاوم للصدأ', 'مقاوم للضغط العالي', 'تركيب سهل وسريع', 'مناسب لمياه الشرب',
  'عمر افتراضي طويل', 'سطح أملس لتقليل الاحتكاك', 'تحمل كيميائي ممتاز'
];

const SPEC_PRESETS = [
  'طول اللفة / الرول',
  'تصريف النقاطات',
  'المسافة بين النقاطات',
  'تحمل الضغط',
  'نوع الخامة',
  'قطر الخرطوم',
  'سمك الجدار',
  'معدل الفلترة',
  'بلد المنشأ',
  'فترة الضمان'
];

const DEFAULT_MATRIX = [
  { size: '20', outer: '20.30', inner: '16.20', wall: '2.05', radius: '26', pressure: '16 بار' },
  { size: '25', outer: '25.30', inner: '20.20', wall: '2.55', radius: '33', pressure: '16 بار' },
  { size: '32', outer: '32.30', inner: '26.20', wall: '3.05', radius: '42', pressure: '16 بار' },
  { size: '40', outer: '40.30', inner: '32.30', wall: '3.55', radius: '52', pressure: '16 بار' },
  { size: '50', outer: '50.30', inner: '40.20', wall: '4.55', radius: '65', pressure: '16 بار' },
  { size: '63', outer: '63.30', inner: '50.20', wall: '5.65', radius: '82', pressure: '16 بار' },
  { size: '110', outer: '110.40', inner: '87.40', wall: '10.00', radius: '143', pressure: '16 بار' },
  { size: '160', outer: '160.50', inner: '128.40', wall: '14.00', radius: '205', pressure: '16 بار' },
];

const sanitizeSlug = (raw: string): string => {
  return (raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const generateSlugFromText = (titleAr: string, titleEn?: string, skuOrId?: string): string => {
  let base = (titleEn || '').trim().toLowerCase();
  if (!base) {
    base = (titleAr || '').trim().toLowerCase();
  }

  let clean = sanitizeSlug(base);
  if (!clean) {
    clean = 'product';
  }

  const suffix = (skuOrId || '').trim().replace(/[^a-zA-Z0-9]/g, '').slice(-5) || Math.random().toString(36).substring(2, 6);
  return `${clean}-${suffix}`;
};

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

  // Form View State
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

  // Descriptions
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');

  // Images & Drawing
  const [imageUrl, setImageUrl] = useState('');
  const [drawingUrl, setDrawingUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');

  // Specs, Sizes & Pressure
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['20 مم', '25 مم', '32 مم', '110 مم', '160 مم']);
  const [availablePressures, setAvailablePressures] = useState<string[]>(COMMON_PRESSURES);
  const [selectedPressures, setSelectedPressures] = useState<string[]>(['6 بار', '10 بار', '16 بار']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customPressureNumber, setCustomPressureNumber] = useState('');
  
  // Block A: Optional Dimensions Matrix Table (جدول الأبعاد والمقاسات الهندسية)
  const [enableMatrix, setEnableMatrix] = useState(false);
  const [sizesMatrix, setSizesMatrix] = useState<Array<{ size: string; outer: string; inner: string; wall: string; radius: string; pressure: string }>>(DEFAULT_MATRIX);
  
  // Block B: Dynamic Technical Specifications (المواصفات الفنية الحرة)
  const [technicalSpecs, setTechnicalSpecs] = useState<Array<{ key: string; value: string }>>([]);

  // Technical Specs fields (legacy/defaults)
  const [material, setMaterial] = useState('PVC');
  const [connectionType, setConnectionType] = useState('ملحوم / لاصق');
  const [sealMaterial, setSealMaterial] = useState('EPDM');
  const [temperature, setTemperature] = useState('0°C - 45°C');
  const [origin, setOrigin] = useState('تركيا');
  const [warranty, setWarranty] = useState('سنة واحدة');

  // Features Checklist (Dynamic Tags & Selection)
  const [availableFeatures, setAvailableFeatures] = useState<string[]>(COMMON_FEATURES);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'مقاوم للصدأ', 'مقاوم للضغط العالي', 'تركيب سهل وسريع', 'عمر افتراضي طويل'
  ]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  // Inventory & Status
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
    setDrawingUrl('');
    setPdfUrl('');
    setGalleryImages([]);
    setDeletedImageUrls([]);
    setLoadingGallery(false);
    setCustomImageUrlInput('');
    setSelectedSizes(['20 مم', '25 مم', '32 مم', '110 مم', '160 مم']);
    setAvailablePressures(COMMON_PRESSURES);
    setSelectedPressures(['6 بار', '10 بار', '16 بار']);
    setCustomPressureNumber('');
    setCustomSizeInput('');
    setEnableMatrix(false);
    setSizesMatrix(DEFAULT_MATRIX);
    setTechnicalSpecs([]);
    setMaterial('PVC');
    setConnectionType('ملحوم / لاصق');
    setSealMaterial('EPDM');
    setTemperature('0°C - 45°C');
    setOrigin('تركيا');
    setWarranty('سنة واحدة');
    setAvailableFeatures(COMMON_FEATURES);
    setSelectedFeatures(['مقاوم للصدأ', 'مقاوم للضغط العالي', 'تركيب سهل وسريع', 'عمر افتراضي طويل']);
    setCustomFeatureInput('');
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

  // Open Form for Adding New Product
  const handleOpenAddForm = () => {
    resetForm();
    setShowForm(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Open Form for Editing
  const handleEdit = (p: any) => {
    if (!p) return;
    setEditingProduct(p);
    setTitle(p.title || '');
    setTitleEn(p.title_en || '');
    setCategoryId(p.category_id || p.categoryId || '');
    setSubCategory(p.subcategory || '');
    setBrandName(p.brand || 'ERA');
    setModelNumber(p.model_number || '');
    setProductCode(p.product_code || '');
    setBarcode(p.barcode || '');
    setDescription(p.description || '');
    setFullDescription(p.full_description || p.description || '');
    setImageUrl(p.image_url || '');
    setDrawingUrl(p.drawing_url || '');
    setPdfUrl(p.pdf_url || '');
    setDeletedImageUrls([]);
    setCustomImageUrlInput('');

    // Pre-populate gallery with primary image and any attached p.images
    const initialImages: string[] = [];
    if (p.image_url) {
      initialImages.push(p.image_url);
    }
    if (Array.isArray(p.images)) {
      p.images.forEach((item: any) => {
        const url = typeof item === 'string' ? item : item?.image_url;
        if (url && !initialImages.includes(url)) {
          initialImages.push(url);
        }
      });
    }
    setGalleryImages(initialImages);

    // Fetch all product_images asynchronously from Supabase
    if (p.id) {
      setLoadingGallery(true);
      supabase
        .from('product_images')
        .select('image_url, order')
        .eq('product_id', p.id)
        .order('order', { ascending: true })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setGalleryImages(prev => {
              const merged = [...prev];
              data.forEach((row: any) => {
                if (row.image_url && !merged.includes(row.image_url)) {
                  merged.push(row.image_url);
                }
              });
              return merged;
            });
            setImageUrl(current => current || data[0]?.image_url || '');
          }
        })
        .catch(err => {
          console.warn('Could not load product_images in edit mode:', err);
        })
        .finally(() => {
          setLoadingGallery(false);
        });
    }

    setSelectedSizes(Array.isArray(p.sizes) ? p.sizes : ['20 مم', '25 مم', '32 مم', '110 مم', '160 مم']);
    setSelectedPressures(Array.isArray(p.pressures) ? p.pressures : ['6 بار', '10 بار', '16 بار']);

    // Parse technical specs & matrix safely
    let loadedSpecs: Array<{ key: string; value: string }> = [];
    let loadedMatrix: any[] = [];
    let hasMatrix = false;

    if (p.specs) {
      if (Array.isArray(p.specs)) {
        loadedSpecs = p.specs.map((item: any) => ({
          key: item.key || item.label || item.name || '',
          value: item.value || ''
        })).filter((s: any) => s.key || s.value);
      } else if (typeof p.specs === 'object') {
        if (Array.isArray(p.specs.technical_specs)) {
          loadedSpecs = p.specs.technical_specs.map((item: any) => ({
            key: item.key || item.label || item.name || '',
            value: item.value || ''
          })).filter((s: any) => s.key || s.value);
        }
        if (Array.isArray(p.specs.sizes_matrix) && p.specs.sizes_matrix.length > 0) {
          loadedMatrix = p.specs.sizes_matrix;
          hasMatrix = Boolean(p.specs.has_matrix ?? true);
        }
      }
    }

    if (Array.isArray(p.technical_specs) && p.technical_specs.length > 0) {
      loadedSpecs = p.technical_specs.map((item: any) => ({
        key: item.key || item.label || item.name || '',
        value: item.value || ''
      }));
    }

    if (Array.isArray(p.sizes_matrix) && p.sizes_matrix.length > 0) {
      loadedMatrix = p.sizes_matrix;
      hasMatrix = true;
    }

    setTechnicalSpecs(loadedSpecs);
    setSizesMatrix(loadedMatrix.length > 0 ? loadedMatrix : DEFAULT_MATRIX);
    setEnableMatrix(hasMatrix);

    setMaterial(p.material || 'PVC');
    setConnectionType(p.connection_type || 'ملحوم / لاصق');
    setSealMaterial(p.seal_material || 'EPDM');
    setTemperature(p.temperature || '0°C - 45°C');
    setOrigin(p.origin || 'تركيا');
    setWarranty(p.warranty || 'سنة واحدة');
    // Load Pressures
    let loadedPressures: string[] = [];
    if (p.specs && typeof p.specs === 'object' && Array.isArray(p.specs.pressures)) {
      loadedPressures = p.specs.pressures.filter(Boolean);
    } else if (Array.isArray(p.pressures)) {
      loadedPressures = p.pressures.filter(Boolean);
    } else if (Array.isArray(loadedMatrix) && loadedMatrix.length > 0) {
      const fromMatrix = Array.from(new Set(loadedMatrix.map((r: any) => r.pressure).filter(Boolean)));
      if (fromMatrix.length > 0) loadedPressures = fromMatrix as string[];
    }
    setAvailablePressures(Array.from(new Set([...COMMON_PRESSURES, ...loadedPressures])));
    setSelectedPressures(loadedPressures.length > 0 ? loadedPressures : ['6 بار', '10 بار', '16 بار']);
    setCustomPressureNumber('');

    // Load Features
    const loadedFeatures = Array.isArray(p.features)
      ? p.features.map((f: any) => typeof f === 'string' ? f : (f?.title || f?.name || f?.feature || '')).filter(Boolean)
      : (p.specs && typeof p.specs === 'object' && Array.isArray(p.specs.features))
        ? p.specs.features.filter(Boolean)
        : [];
    setAvailableFeatures(Array.from(new Set([...COMMON_FEATURES, ...loadedFeatures])));
    setSelectedFeatures(loadedFeatures);
    setCustomFeatureInput('');
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
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

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

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const { url } = await uploadFileToSupabase(file, 'catalogs');
      setPdfUrl(url);
      toast({ title: 'تم رفع الكتالوج بنجاح 📄' });
    } catch (err: any) {
      toast({ title: 'خطأ أثناء رفع الكتالوج', description: err.message, variant: 'destructive' });
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

  // Gallery Management Handlers
  const handleRemoveGalleryImage = (imgToRemove: string) => {
    setGalleryImages(prev => prev.filter(img => img !== imgToRemove));
    setDeletedImageUrls(prev => (prev.includes(imgToRemove) ? prev : [...prev, imgToRemove]));

    if (imageUrl === imgToRemove) {
      const remaining = galleryImages.filter(img => img !== imgToRemove);
      setImageUrl(remaining.length > 0 ? remaining[0] : '');
    }
  };

  const handleSetPrimaryImage = (imgUrl: string) => {
    setImageUrl(imgUrl);
    toast({ title: 'تم تعيين الصورة كصورة رئيسية للمنتج ★' });
  };

  const handleAddCustomImageUrl = () => {
    const url = customImageUrlInput.trim();
    if (!url) return;
    if (!galleryImages.includes(url)) {
      setGalleryImages(prev => [...prev, url]);
    }
    if (!imageUrl) {
      setImageUrl(url);
    }
    setCustomImageUrlInput('');
    toast({ title: 'تمت إضافة رابط الصورة إلى المعرض 🖼️' });
  };

  // Toggle Size selection
  const toggleSize = (sz: string) => {
    setSelectedSizes(prev => Array.isArray(prev) ? (prev.includes(sz) ? prev.filter(x => x !== sz) : [...prev, sz]) : [sz]);
  };

  const addCustomSize = () => {
    if (!customSizeInput.trim()) return;
    const val = customSizeInput.trim();
    setSelectedSizes(prev => Array.isArray(prev) ? (prev.includes(val) ? prev : [...prev, val]) : [val]);
    setCustomSizeInput('');
  };

  // Toggle Pressure selection (Locked strictly to Bar)
  const togglePressure = (pr: string) => {
    setSelectedPressures(prev => Array.isArray(prev) ? (prev.includes(pr) ? prev.filter(x => x !== pr) : [...prev, pr]) : [pr]);
  };

  const addCustomPressure = () => {
    const raw = customPressureNumber.trim().replace(/[^\d.]/g, '');
    if (!raw) return;
    const formatted = `${raw} بار`;
    setAvailablePressures(prev => (prev.includes(formatted) ? prev : [...prev, formatted]));
    setSelectedPressures(prev => (prev.includes(formatted) ? prev : [...prev, formatted]));
    setCustomPressureNumber('');
  };

  const removePressureOption = (pr: string) => {
    setAvailablePressures(prev => prev.filter(x => x !== pr));
    setSelectedPressures(prev => prev.filter(x => x !== pr));
  };

  // Technical Specs Handlers (Block B)
  const addTechnicalSpec = (key = '', value = '') => {
    setTechnicalSpecs(prev => [...prev, { key, value }]);
  };

  const updateTechnicalSpec = (idx: number, field: 'key' | 'value', val: string) => {
    setTechnicalSpecs(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  const removeTechnicalSpec = (idx: number) => {
    setTechnicalSpecs(prev => prev.filter((_, i) => i !== idx));
  };

  // Matrix Row Handlers (Block A)
  const addMatrixRow = () => {
    setSizesMatrix(prev => Array.isArray(prev) ? [...prev, { size: '200', outer: '200.00', inner: '160.00', wall: '16.00', radius: '250', pressure: '16 بار' }] : DEFAULT_MATRIX);
  };

  const updateMatrixRow = (idx: number, key: string, val: string) => {
    setSizesMatrix(prev => Array.isArray(prev) ? prev.map((row, i) => i === idx ? { ...row, [key]: val } : row) : DEFAULT_MATRIX);
  };

  const removeMatrixRow = (idx: number) => {
    setSizesMatrix(prev => Array.isArray(prev) ? prev.filter((_, i) => i !== idx) : []);
  };

  // Toggle Feature selection (Dynamic Tags & Selection)
  const toggleFeature = (feat: string) => {
    setSelectedFeatures(prev => Array.isArray(prev) ? (prev.includes(feat) ? prev.filter(x => x !== feat) : [...prev, feat]) : [feat]);
  };

  const addCustomFeature = () => {
    const val = customFeatureInput.trim();
    if (!val) return;
    setAvailableFeatures(prev => (prev.includes(val) ? prev : [...prev, val]));
    setSelectedFeatures(prev => (prev.includes(val) ? prev : [...prev, val]));
    setCustomFeatureInput('');
  };

  const removeFeatureOption = (feat: string) => {
    setAvailableFeatures(prev => prev.filter(x => x !== feat));
    setSelectedFeatures(prev => prev.filter(x => x !== feat));
  };

  // Save Product (Insert or Update)
  const handleSave = async (andCreateNew = false) => {
    if (!title.trim()) {
      toast({ title: 'تنبيه', description: 'يرجى كتابة اسم المنتج بالعربي', variant: 'destructive' });
      return;
    }

    // Generate safe slug
    let generatedSlug = slug.trim() ? sanitizeSlug(slug) : '';
    if (!generatedSlug) {
      generatedSlug = generateSlugFromText(title, titleEn, productCode || editingProduct?.id);
    }
    if (!generatedSlug) {
      generatedSlug = `product-${Date.now().toString().slice(-6)}`;
    }

    const filteredSpecs = technicalSpecs
      .map(s => ({ key: s.key.trim(), value: s.value.trim() }))
      .filter(s => s.key || s.value);

    const filteredMatrix = enableMatrix
      ? sizesMatrix
          .map(r => ({
            size: (r.size || '').trim(),
            outer: (r.outer || '').trim(),
            inner: (r.inner || '').trim(),
            wall: (r.wall || '').trim(),
            radius: (r.radius || '').trim(),
            pressure: (r.pressure || '').trim()
          }))
          .filter(r => r.size)
      : [];

    const specsPayload = {
      technical_specs: filteredSpecs,
      sizes_matrix: filteredMatrix,
      has_matrix: enableMatrix && filteredMatrix.length > 0,
      pressures: selectedPressures,
      features: selectedFeatures,
    };

    const payload: any = {
      title: title.trim(),
      slug: generatedSlug,
      description: description.trim() || title.trim(),
      category_id: categoryId || null,
      brand: brandName.trim() || 'ال شريف',
      product_code: productCode.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      image_url: imageUrl || (galleryImages[0] || null),
      availability: availability,
      featured: featured,
      sizes: selectedSizes,
      features: (selectedFeatures || []).map(f => ({ title: f })),
      specs: specsPayload,
      meta_title: metaTitle.trim() || title.trim(),
      meta_description: metaDescription.trim() || description.trim(),
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingProduct) {
        let { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) {
          console.warn('Update failed, retrying with core payload:', error);
          const corePayload = {
            title: payload.title,
            slug: payload.slug,
            description: payload.description,
            category_id: payload.category_id,
            brand: payload.brand,
            image_url: payload.image_url,
            availability: payload.availability,
            featured: payload.featured,
            specs: payload.specs,
            sizes: payload.sizes,
            features: payload.features,
            updated_at: payload.updated_at,
          };
          const res = await supabase.from('products').update(corePayload).eq('id', editingProduct.id);
          if (res.error) throw res.error;
        }

        // 1. Delete removed images from product_images table
        if (deletedImageUrls.length > 0) {
          try {
            await supabase
              .from('product_images')
              .delete()
              .eq('product_id', editingProduct.id)
              .in('image_url', deletedImageUrls);
          } catch (delErr) {
            console.warn('Failed to delete removed product_images:', delErr);
          }
        }

        // 2. Sync newly added gallery images to product_images table
        try {
          const { data: existingRows } = await supabase
            .from('product_images')
            .select('image_url')
            .eq('product_id', editingProduct.id);

          const existingUrls = new Set((existingRows || []).map((r: any) => r.image_url));
          const newImages = galleryImages
            .filter(url => url && !existingUrls.has(url))
            .map((url, idx) => ({
              product_id: editingProduct.id,
              image_url: url,
              order: (existingRows?.length || 0) + idx,
            }));

          if (newImages.length > 0) {
            await supabase.from('product_images').insert(newImages);
          }
        } catch (syncErr) {
          console.warn('Failed to sync product_images on edit:', syncErr);
        }

        queryClient.invalidateQueries({ queryKey: ['product_images', editingProduct.id] });
        queryClient.invalidateQueries({ queryKey: ['all_product_images'] });

        const savedSlug = payload.slug || editingProduct?.slug || editingProduct?.id;
        toast({
          title: 'تم تحديث بيانات المنتج بنجاح ✨',
          description: `الرابط: /product/${savedSlug}`,
          action: (
            <a
              href={`/product/${encodeURIComponent(savedSlug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground hover:opacity-90"
            >
              معاينة بالمتجر ↗
            </a>
          ) as any,
        });
      } else {
        let { data, error } = await supabase.from('products').insert([payload]).select().single();
        if (error) {
          console.warn('Insert failed, retrying with core payload:', error);
          const corePayload = {
            title: payload.title,
            slug: payload.slug,
            description: payload.description,
            category_id: payload.category_id,
            brand: payload.brand,
            image_url: payload.image_url,
            availability: payload.availability,
            featured: payload.featured,
            specs: payload.specs,
            sizes: payload.sizes,
            features: payload.features,
          };
          const res = await supabase.from('products').insert([corePayload]).select().single();
          if (res.error) throw res.error;
          data = res.data;
        }

        // Insert gallery images if any
        if (data?.id && galleryImages.length > 0) {
          const imageRows = galleryImages.map((url, idx) => ({
            product_id: data.id,
            image_url: url,
            order: idx,
          }));
          await supabase.from('product_images').insert(imageRows);
        }
        const savedSlug = payload.slug || data?.slug || data?.id;
        toast({
          title: 'تمت إضافة المنتج بنجاح 🎉',
          description: `الرابط: /product/${savedSlug}`,
          action: (
            <a
              href={`/product/${encodeURIComponent(savedSlug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground hover:opacity-90"
            >
              معاينة بالمتجر ↗
            </a>
          ) as any,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });

      if (andCreateNew) {
        resetForm();
        setShowForm(true);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } else {
        setShowForm(false);
        resetForm();
      }
    } catch (err: any) {
      console.error('Save Product Error:', err);
      toast({ title: 'خطأ في الحفظ', description: err.message || 'يرجى التأكد من البيانات والمحاولة مجدداً', variant: 'destructive' });
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

  const filteredProducts = (products || []).filter((p: any) => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCat || p.category_id === selectedCat;
    const matchBrand = !selectedBrand || p.brand === selectedBrand;
    return matchSearch && matchCat && matchBrand;
  });

  const safeGalleryImages = Array.isArray(galleryImages) ? galleryImages : [];
  const safeSelectedSizes = Array.isArray(selectedSizes) ? selectedSizes : [];
  const safeSelectedPressures = Array.isArray(selectedPressures) ? selectedPressures : [];
  const safeAvailablePressures = Array.isArray(availablePressures) ? availablePressures : COMMON_PRESSURES;
  const safeSizesMatrix = Array.isArray(sizesMatrix) ? sizesMatrix : DEFAULT_MATRIX;
  const safeSelectedFeatures = Array.isArray(selectedFeatures) ? selectedFeatures : [];
  const safeAvailableFeatures = Array.isArray(availableFeatures) ? availableFeatures : COMMON_FEATURES;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* View 1: Add/Edit Product Full Page Form */}
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
              {editingProduct && (
                <a
                  href={`/product/${encodeURIComponent(editingProduct.slug || editingProduct.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 text-primary bg-primary/10 px-4 py-2.5 text-xs font-bold hover:bg-primary hover:text-white transition-all cursor-pointer"
                >
                  <Eye className="h-4 w-4" /> معاينة بالمتجر ↗
                </a>
              )}

              <button
                type="button"
                onClick={() => handleSave(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
              >
                <Save className="h-4 w-4" /> حفظ المنتج
              </button>

              <button
                type="button"
                onClick={() => handleSave(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 text-emerald-600 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> حفظ وإضافة جديد
              </button>

              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 text-rose-600 bg-rose-50 px-4 py-2.5 text-xs font-bold hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" /> إلغاء
              </button>
            </div>
          </div>

          {/* Cards Grid Container */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Left Column: Product Images + Drawing + Status */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* Card 1: صور المنتج (Product Images) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <ImageIcon className="h-4 w-4" /> صور المنتج والمعرض
                  </div>
                  {loadingGallery ? (
                    <span className="flex items-center gap-1.5 text-[11px] text-primary font-bold animate-pulse">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> جاري تحميل الصور...
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">({safeGalleryImages.length} صور)</span>
                  )}
                </div>

                {/* Dropzone */}
                <div className="relative rounded-2xl border-2 border-dashed border-border bg-accent/20 p-6 text-center hover:border-primary/50 transition-colors">
                  <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Upload className="mx-auto h-8 w-8 text-primary/70 mb-2" />
                  <p className="text-xs font-bold text-foreground">اضغط لرفع الصور من جهازك</p>
                  <p className="text-[10px] text-muted-foreground mt-1">أو اسحب الصور وأفلتها هنا (JPG, PNG, WebP)</p>
                </div>

                {/* URL Input Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customImageUrlInput}
                    onChange={e => setCustomImageUrlInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomImageUrl(); } }}
                    placeholder="أو أضف رابط صورة مباشر (URL)..."
                    className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomImageUrl}
                    className="shrink-0 rounded-xl bg-accent border border-border px-3 py-2 text-xs font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer"
                  >
                    + إضافة
                  </button>
                </div>

                {/* Image Thumbnails Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {safeGalleryImages.map((img, i) => {
                    const isPrimary = (imageUrl === img) || (!imageUrl && i === 0);
                    return (
                      <div
                        key={i}
                        className={`group relative aspect-square rounded-2xl border-2 overflow-hidden bg-muted/30 p-2 flex items-center justify-center transition-all ${
                          isPrimary
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5 shadow-sm'
                            : 'border-border/80 hover:border-primary/50'
                        }`}
                      >
                        {/* Image element with object-contain */}
                        <img
                          src={img}
                          alt={`Product thumbnail ${i + 1}`}
                          className="max-h-full max-w-full object-contain rounded-lg drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Top-left Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(img)}
                          title="حذف هذه الصورة"
                          className="absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-transform active:scale-95 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Primary Badge or Action Button */}
                        {isPrimary ? (
                          <div className="absolute bottom-2 inset-x-2 z-10 flex items-center justify-center gap-1 rounded-md bg-emerald-600/95 backdrop-blur-sm py-1 text-[10px] font-black text-white shadow-sm">
                            <Star className="h-3 w-3 fill-current" />
                            <span>رئيسية</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(img)}
                            className="absolute bottom-2 inset-x-2 z-10 flex items-center justify-center gap-1 rounded-md bg-black/75 backdrop-blur-sm py-1 text-[10px] font-bold text-white shadow-sm hover:bg-emerald-600 transition-all opacity-95 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                          >
                            <span>تعيين كرئيسية</span>
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Single Image Box */}
                  <label
                    htmlFor="add-single-img"
                    className="aspect-square rounded-2xl border-2 border-dashed border-border bg-accent/20 hover:bg-accent/40 hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer text-muted-foreground text-xs font-bold gap-1.5 transition-colors p-2 text-center"
                  >
                    <Plus className="h-6 w-6 text-primary" />
                    <span>إضافة صورة أخرى</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} id="add-single-img" className="hidden" />
                  </label>
                </div>

                <p className="text-[10px] text-muted-foreground text-center">
                  * انقر على "تعيين كرئيسية" لتحديد الصورة البارزة في المتجر وبطاقات المنتجات.
                </p>
              </div>

              {/* Card 2: الرسم الفني (Technical Blueprint Diagram) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm border-b border-border/50 pb-3">
                  <FileText className="h-4 w-4" /> الرسم الفني والكتالوج (Diagram & PDF)
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">صورة الرسم الفني الهيكلي (Technical Diagram)</label>
                    <div className="flex items-center gap-2">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="drawing-img-input" />
                      <label htmlFor="drawing-img-input" className="cursor-pointer rounded-xl bg-accent border border-border px-3 py-2 font-bold text-xs hover:bg-primary hover:text-white shrink-0">
                        {uploading ? 'جاري الرفع...' : 'رفع رسم فني'}
                      </label>
                      <input type="text" value={drawingUrl} onChange={e => setDrawingUrl(e.target.value)} placeholder="أو ضع رابط صورة الرسم الفني..." className="w-full rounded-xl border border-input bg-background p-2 text-xs outline-none" dir="ltr" />
                    </div>
                    {drawingUrl && (
                      <div className="mt-2 h-20 w-full rounded-xl border border-border bg-accent/20 p-2 flex items-center justify-center">
                        <img src={drawingUrl} alt="Diagram" className="max-h-full max-w-full object-contain" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">كتالوج المنتج (PDF أو صورة من الجهاز)</label>
                    <div className="flex items-center gap-2">
                      <input type="file" accept=".pdf,image/*" onChange={handlePdfUpload} className="hidden" id="pdf-file-input" />
                      <label htmlFor="pdf-file-input" className="cursor-pointer rounded-xl bg-emerald-600 text-white px-3 py-2 font-bold text-xs hover:bg-emerald-700 shrink-0 shadow-sm flex items-center gap-1.5">
                        <FileDown className="h-4 w-4" /> {uploading ? 'جاري الرفع...' : 'رفع من الجهاز (PDF/صورة)'}
                      </label>
                      <input type="text" value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="أو ضع رابط مباشر للكتالوج..." className="w-full rounded-xl border border-input bg-background p-2 text-xs outline-none" dir="ltr" />
                    </div>
                    {pdfUrl && (
                      <div className="mt-2 p-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-xs text-emerald-700 font-bold">
                        <span className="truncate max-w-[220px]" dir="ltr">{pdfUrl}</span>
                        <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">معاينة ↗</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 3: حالة التوفر (Availability) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm border-b border-border/50 pb-3">
                  <CheckSquare className="h-4 w-4" /> حالة التوفر بالمخزن
                </div>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">حالة المنتج بالموقع *</label>
                    <select value={availability} onChange={e => setAvailability(e.target.value)} className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-bold text-emerald-600 outline-none">
                      <option value="available">• متوفر في المخزون</option>
                      <option value="on_request">• متوفر عند الطلب</option>
                      <option value="out_of_stock">• غير متوفر حالياً</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Middle & Right Column: Basic Data + Descriptions + Specs + Matrix */}
            <div className="space-y-6 lg:col-span-2">
              
              {/* Card 4: البيانات الأساسية (Basic Info) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-border/50 pb-3">
                  <Tag className="h-4 w-4" /> البيانات الأساسية
                </div>
                
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">اسم المنتج بالعربي *</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: كوع 90 درجة PVC ضغط عالي" className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">الاسم بالإنجليزي</label>
                    <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="PVC 90 Degree Elbow High Pressure" className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary" dir="ltr" />
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
                    <input type="text" value={subCategory} onChange={e => setSubCategory(e.target.value)} placeholder="أكواع PVC" className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary" />
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">الماركة * (اختر من القائمة أو اكتب يدوياً)</label>
                    <div className="space-y-1.5">
                      <select value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:border-primary font-bold text-primary">
                        <option value="DKV">DKV</option>
                        <option value="AZUD">AZUD</option>
                        <option value="NETAFIM">NETAFIM</option>
                        <option value="PLASSON">PLASSON</option>
                        <option value="Rivulis">Rivulis</option>
                        <option value="ASTORE">ASTORE</option>
                        {brands?.map((b: any) => <option key={b.id} value={b.name}>{b.name}</option>)}
                      </select>
                      <input
                        type="text"
                        value={brandName}
                        onChange={e => setBrandName(e.target.value)}
                        placeholder="أو اكتب اسم الماركة يدوياً..."
                        className="w-full rounded-xl border border-input bg-background p-2 text-xs outline-none focus:border-primary font-bold text-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">رمز / كود المنتج (SKU) *</label>
                    <input type="text" value={productCode} onChange={e => setProductCode(e.target.value)} placeholder="SKU-EL-90-110" className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary font-mono" dir="ltr" />
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
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} maxLength={300} placeholder="اكتب وصفاً موجزاً يظهر في صفحة التفاصيل والكروت..." className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary resize-none" />
                  </div>
                </div>
              </div>

              {/* Card 6: المقاسات والضغط (Sizes & Pressures Selectors) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <Sliders className="h-4 w-4" /> المقاسات المتاحة والضغط (Sizes & Pressure)
                  </div>
                  <span className="text-[11px] text-muted-foreground">اختر القيم ليتم تفعيلها في شريط الخيارات بصفحة التفاصيل</span>
                </div>

                {/* Sizes Selector Pills */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground">المقاسات المتاحة (* انقر للتفعيل):</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SIZES.map(sz => {
                      const isSelected = safeSelectedSizes.includes(sz);
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

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={customSizeInput}
                      onChange={e => setCustomSizeInput(e.target.value)}
                      placeholder="إضافة مقاس مخصص (مثال: 200 مم)..."
                      className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs outline-none flex-1"
                    />
                    <button type="button" onClick={addCustomSize} className="rounded-xl bg-accent border border-border px-4 py-1.5 text-xs font-bold text-foreground hover:bg-primary hover:text-white">
                      + إضافة مقاس
                    </button>
                  </div>
                </div>

                {/* Pressures Selector Pills (Locked strictly to Bar) */}
                <div className="space-y-2.5 border-t border-border/40 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-foreground">
                      خيارات الضغط المتاحة بوحدة البار (* انقر للتفعيل):
                    </label>
                    <span className="text-[10px] text-muted-foreground">الوحدة المعتمدة: بار (Bar)</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {safeAvailablePressures.map(pr => {
                      const isSelected = safeSelectedPressures.includes(pr);
                      const isCustom = !COMMON_PRESSURES.includes(pr);
                      return (
                        <div key={pr} className="relative inline-flex items-center group">
                          <button
                            type="button"
                            onClick={() => togglePressure(pr)}
                            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-border bg-accent/20 text-muted-foreground hover:bg-accent'
                            }`}
                          >
                            {pr} {isSelected ? '✓' : ''}
                          </button>
                          {isCustom && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removePressureOption(pr); }}
                              className="absolute -top-1.5 -left-1.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer"
                              title="حذف هذا الخيار"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Pressure by Number only */}
                  <div className="flex items-center gap-2 pt-1 max-w-sm">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={customPressureNumber}
                        onChange={e => setCustomPressureNumber(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomPressure(); } }}
                        placeholder="أدخل قيمة الضغط كرقم (مثال: 4 أو 8)..."
                        className="w-full rounded-xl border border-input bg-background pl-14 pr-3 py-2 text-xs outline-none focus:border-primary font-bold"
                        dir="ltr"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-600 pointer-events-none">
                        بار
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={addCustomPressure}
                      className="rounded-xl bg-accent border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      + إضافة ضغط
                    </button>
                  </div>
                </div>

              </div>

              {/* Modular Block B: المواصفات الفنية الحرة (Dynamic Technical Specifications) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                      <ListPlus className="h-4 w-4" /> المواصفات الفنية الحرة (Dynamic Technical Specifications)
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      مناسب لخراطيم الري بالتنقيط، الفلاتر، الرشاشات، الطلمبات، وكافة المعدات
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addTechnicalSpec('', '')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-primary/90 transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="h-4 w-4" /> إضافة مواصفة فنية
                  </button>
                </div>

                {/* Quick Presets Bar */}
                <div className="space-y-1.5 bg-accent/20 p-3 rounded-xl border border-border/50">
                  <span className="block text-[11px] font-bold text-muted-foreground">
                    ⚡ إضافة سريعة لمواصفات شائعة (انقر للإضافة):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SPEC_PRESETS.map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => addTechnicalSpec(preset, '')}
                        className="rounded-lg border border-border/80 bg-card hover:bg-primary hover:text-white px-2.5 py-1 text-[11px] font-medium text-foreground transition-all cursor-pointer shadow-xs"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Repeater List */}
                {technicalSpecs.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/80 bg-accent/10 p-6 text-center space-y-2">
                    <ListPlus className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="text-xs font-bold text-foreground">لا توجد مواصفات فنية مضافة حالياً</p>
                    <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                      يمكنك إضافة مواصفات مثل: طول اللفة، تصريف النقاطات، المسافة بين النقاطات، تحمل الضغط، نوع الخامة، إلخ.
                    </p>
                    <button
                      type="button"
                      onClick={() => addTechnicalSpec('', '')}
                      className="inline-flex items-center gap-1 rounded-xl bg-accent border border-border px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-primary hover:text-white transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> إضافة أول مواصفة
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="hidden sm:grid sm:grid-cols-[1fr_1.2fr_auto] gap-2 px-2 text-[11px] font-bold text-muted-foreground">
                      <span>اسم الخاصية</span>
                      <span>القيمة</span>
                      <span className="w-8 text-center">إجراء</span>
                    </div>

                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {technicalSpecs.map((spec, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:grid sm:grid-cols-[1fr_1.2fr_auto] gap-2 p-2 rounded-xl border border-border bg-accent/10 hover:border-primary/40 transition-colors"
                        >
                          <div>
                            <input
                              type="text"
                              value={spec.key}
                              onChange={e => updateTechnicalSpec(idx, 'key', e.target.value)}
                              placeholder="اسم الخاصية (مثال: تصريف النقاطات)..."
                              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={spec.value}
                              onChange={e => updateTechnicalSpec(idx, 'value', e.target.value)}
                              placeholder="القيمة (مثال: 4 لتر / ساعة)..."
                              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                            />
                          </div>
                          <div className="flex items-center justify-end sm:justify-center">
                            <button
                              type="button"
                              onClick={() => removeTechnicalSpec(idx)}
                              className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                              title="حذف المواصفة"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modular Block A: جدول الأبعاد والمقاسات الهندسية (Optional Dimensions & Technical Matrix) */}
              <div className={`rounded-2xl border transition-all p-5 shadow-sm space-y-4 ${
                enableMatrix ? 'border-indigo-500/40 bg-card ring-1 ring-indigo-500/10' : 'border-border bg-card'
              }`}>
                {/* Toggle Switch Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                  <label className="flex items-start sm:items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableMatrix}
                      onChange={e => setEnableMatrix(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 mt-0.5 sm:mt-0 ${
                      enableMatrix ? 'bg-indigo-600' : 'bg-muted-foreground/30'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        enableMatrix ? '-translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-foreground">
                          تفعيل جدول الأبعاد والمقاسات الهندسية (خاص بالقطع والمحابس والوصلات)
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          enableMatrix ? 'bg-indigo-100 text-indigo-700' : 'bg-muted text-muted-foreground'
                        }`}>
                          {enableMatrix ? 'مفعل ✓' : 'معطل'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        عند التعطيل لن يتم حفظ أي أبعاد سباكة فارغة ولن يظهر الجدول في صفحة المنتج.
                      </p>
                    </div>
                  </label>

                  {enableMatrix && (
                    <button
                      type="button"
                      onClick={addMatrixRow}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-700 transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="h-3.5 w-3.5" /> إضافة صف جديد
                    </button>
                  )}
                </div>

                {!enableMatrix ? (
                  <div className="p-3.5 rounded-xl border border-dashed border-border bg-accent/20 flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Info className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span>
                      جدول الأبعاد الهندسية معطل لهذا المنتج. لن يتم حفظ أي بيانات سباكة فارغة ولن يظهر الجدول في صفحة المنتج (مثالي لخراطيم الري، الفلاتر، ومعدات الري العامة).
                    </span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
                          <th className="p-2">المقاس</th>
                          <th className="p-2">القطر الخارجي (D)</th>
                          <th className="p-2">القطر الداخلي (d)</th>
                          <th className="p-2">السمك (t)</th>
                          <th className="p-2">نصف القطر (R)</th>
                          <th className="p-2">الضغط</th>
                          <th className="p-2">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {safeSizesMatrix.map((row, idx) => (
                          <tr key={idx} className="hover:bg-accent/20 transition-colors">
                            <td className="p-1"><input type="text" value={row.size || ''} onChange={e => updateMatrixRow(idx, 'size', e.target.value)} className="w-16 rounded border bg-background p-1 text-center font-bold" /></td>
                            <td className="p-1"><input type="text" value={row.outer || ''} onChange={e => updateMatrixRow(idx, 'outer', e.target.value)} className="w-20 rounded border bg-background p-1 text-center" /></td>
                            <td className="p-1"><input type="text" value={row.inner || ''} onChange={e => updateMatrixRow(idx, 'inner', e.target.value)} className="w-20 rounded border bg-background p-1 text-center" /></td>
                            <td className="p-1"><input type="text" value={row.wall || ''} onChange={e => updateMatrixRow(idx, 'wall', e.target.value)} className="w-16 rounded border bg-background p-1 text-center" /></td>
                            <td className="p-1"><input type="text" value={row.radius || ''} onChange={e => updateMatrixRow(idx, 'radius', e.target.value)} className="w-16 rounded border bg-background p-1 text-center" /></td>
                            <td className="p-1"><input type="text" value={row.pressure || ''} onChange={e => updateMatrixRow(idx, 'pressure', e.target.value)} className="w-20 rounded border bg-background p-1 text-center" /></td>
                            <td className="p-1">
                              <button type="button" onClick={() => removeMatrixRow(idx)} className="rounded p-1 text-rose-600 hover:bg-rose-50 cursor-pointer" title="حذف الصف">
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Card 8: مميزات المنتج (Features Checklist) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-sm border-b border-border/50 pb-3">
                  <Sparkles className="h-4 w-4" /> مميزات المنتج
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {safeAvailableFeatures.map(feat => {
                    const isChecked = safeSelectedFeatures.includes(feat);
                    const isCustom = !COMMON_FEATURES.includes(feat);
                    return (
                      <div
                        key={feat}
                        onClick={() => toggleFeature(feat)}
                        className={`group relative flex items-center justify-between gap-2 p-2.5 rounded-xl border cursor-pointer transition-all select-none ${
                          isChecked
                            ? 'border-purple-500 bg-purple-500/10 font-bold text-purple-700 shadow-xs'
                            : 'border-border bg-accent/20 text-muted-foreground hover:bg-accent/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFeature(feat)}
                            className="rounded text-purple-600 shrink-0 pointer-events-none"
                          />
                          <span className="truncate">{feat}</span>
                        </div>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFeatureOption(feat);
                            }}
                            className="h-4 w-4 rounded-full bg-rose-500/20 text-rose-600 hover:bg-rose-500 hover:text-white text-[11px] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                            title="حذف هذه الميزة"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={customFeatureInput}
                    onChange={e => setCustomFeatureInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomFeature(); } }}
                    placeholder="اكتب اسم الميزة واضغط إضافة (مثال: معالج ضد الأشعة فوق البنفسجية UV)..."
                    className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs outline-none flex-1 focus:border-purple-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={addCustomFeature}
                    className="rounded-xl bg-purple-600 text-white border border-purple-600 px-5 py-2.5 text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    + إضافة ميزة
                  </button>
                </div>
              </div>

              {/* Card 9: SEO وخيارات العرض */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-sky-600 font-bold text-sm border-b border-border/50 pb-3">
                  <Globe className="h-4 w-4" /> تحسين البحث (SEO) وخيارات العرض
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-foreground">رابط المنتج (Slug)</label>
                      <button
                        type="button"
                        onClick={() => setSlug(generateSlugFromText(title, titleEn, productCode || editingProduct?.id))}
                        className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
                      >
                        ⚡ توليد تلقائي
                      </button>
                    </div>
                    <input
                      type="text"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      placeholder={generateSlugFromText(title || 'اسم-المنتج', titleEn, productCode)}
                      className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none font-mono"
                      dir="ltr"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1" dir="ltr">
                      رابط المعاينة:{' '}
                      <span className="text-primary font-semibold">
                        /product/{slug.trim() ? sanitizeSlug(slug) : generateSlugFromText(title || 'product', titleEn, productCode)}
                      </span>
                    </p>
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
              type="button"
              onClick={handleOpenAddForm}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-black text-white shadow-lg hover:bg-emerald-700 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> + إضافة منتج جديد
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
                            <span className="text-[10px] text-primary font-bold">{p.brand || 'آل شريف'}</span>
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
                              <a
                                href={`/product/${encodeURIComponent(p.slug || p.id)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg p-2 text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                                title="معاينة في المتجر"
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                              <button type="button" onClick={() => handleEdit(p)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer" title="تعديل">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => handleDelete(p.id)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 cursor-pointer" title="حذف">
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
