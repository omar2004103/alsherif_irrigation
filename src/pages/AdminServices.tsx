import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Upload,
  Trash2,
  Save,
  ExternalLink,
  Check,
  Image as ImageIcon,
  Loader2,
  Eye,
  X,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useServicesData } from '@/hooks/useServicesData';
import { SERVICE_ICONS, ServiceItem } from '@/data/servicesData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MAX_IMAGES_PER_SERVICE = 10;

const AdminServices: React.FC = () => {
  const { toast } = useToast();
  const { services: remoteServices, isLoading, saveServices, isSaving } = useServicesData();

  // Local state for editing services
  const [servicesList, setServicesList] = useState<ServiceItem[]>(remoteServices);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [previewService, setPreviewService] = useState<ServiceItem | null>(null);
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});

  // Sync remote services when loaded
  useEffect(() => {
    if (remoteServices && remoteServices.length > 0) {
      setServicesList(remoteServices);
    }
  }, [remoteServices]);

  // Helper to extract all images for a service in ordered array (index 0 is main cover)
  const getAllImages = (service: ServiceItem): string[] => {
    const list: string[] = [];
    if (service.image_url && service.image_url.trim()) {
      list.push(service.image_url.trim());
    }
    if (Array.isArray(service.gallery_images)) {
      service.gallery_images.forEach(img => {
        if (img && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    return list.slice(0, MAX_IMAGES_PER_SERVICE);
  };

  // Helper to update service images from unified array
  const setAllImages = (serviceId: string, images: string[]) => {
    const clamped = images.slice(0, MAX_IMAGES_PER_SERVICE);
    const main = clamped.length > 0 ? clamped[0] : null;
    const gallery = clamped.length > 1 ? clamped.slice(1) : [];

    setServicesList(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, image_url: main, gallery_images: gallery } : s))
    );
  };

  // Upload single or multiple files
  const handleUploadImages = async (serviceId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const currentService = servicesList.find(s => s.id === serviceId);
    if (!currentService) return;

    const currentImages = getAllImages(currentService);
    const availableSlots = MAX_IMAGES_PER_SERVICE - currentImages.length;

    if (availableSlots <= 0) {
      toast({
        title: 'تم الوصول للحد الأقصى ⚠️',
        description: `لا يمكن إضافة المزيد من الصور. الحد الأقصى هو ${MAX_IMAGES_PER_SERVICE} صور لكل خدمة.`,
        variant: 'destructive',
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    if (files.length > availableSlots) {
      toast({
        title: 'تنبيه الحد الأقصى ℹ️',
        description: `تم قبول أول ${availableSlots} صور فقط لعدم تجاوز الحد الأقصى (${MAX_IMAGES_PER_SERVICE} صور).`,
      });
    }

    setUploadingId(serviceId);
    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        const ext = file.name.split('.').pop() || 'jpg';
        const filePath = `services/${serviceId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }

      const newCombined = [...currentImages, ...uploadedUrls];
      setAllImages(serviceId, newCombined);

      toast({
        title: `تم رفع ${uploadedUrls.length} صورة بنجاح 🖼️`,
        description: 'اضغط "حفظ جميع التغييرات" لتثبيت التحديث على الموقع.',
      });
    } catch (err: any) {
      toast({
        title: 'فشل رفع الصور',
        description: err.message || 'حدث خطأ أثناء رفع الصور',
        variant: 'destructive',
      });
    } finally {
      setUploadingId(null);
    }
  };

  // Add image from manual URL input
  const handleAddUrlImage = (serviceId: string) => {
    const rawUrl = urlInputs[serviceId]?.trim();
    if (!rawUrl) return;

    const currentService = servicesList.find(s => s.id === serviceId);
    if (!currentService) return;

    const currentImages = getAllImages(currentService);
    if (currentImages.length >= MAX_IMAGES_PER_SERVICE) {
      toast({
        title: 'تم الوصول للحد الأقصى ⚠️',
        description: `الحد الأقصى هو ${MAX_IMAGES_PER_SERVICE} صور لكل خدمة.`,
        variant: 'destructive',
      });
      return;
    }

    const newCombined = [...currentImages, rawUrl];
    setAllImages(serviceId, newCombined);
    setUrlInputs(prev => ({ ...prev, [serviceId]: '' }));

    toast({
      title: 'تمت إضافة رابط الصورة ✅',
      description: 'اضغط "حفظ جميع التغييرات" لتثبيت التحديث.',
    });
  };

  // Remove individual image
  const handleRemoveImageByIndex = (serviceId: string, indexToRemove: number) => {
    const currentService = servicesList.find(s => s.id === serviceId);
    if (!currentService) return;

    const currentImages = getAllImages(currentService);
    const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
    setAllImages(serviceId, updated);

    toast({
      title: 'تم حذف الصورة 🗑️',
      description: `المتبقي ${updated.length} من ${MAX_IMAGES_PER_SERVICE} صور.`,
    });
  };

  // Set an image as main cover (moves to index 0)
  const handleSetAsMain = (serviceId: string, indexToPromote: number) => {
    const currentService = servicesList.find(s => s.id === serviceId);
    if (!currentService || indexToPromote === 0) return;

    const currentImages = getAllImages(currentService);
    const item = currentImages[indexToPromote];
    const withoutItem = currentImages.filter((_, idx) => idx !== indexToPromote);
    const updated = [item, ...withoutItem];
    setAllImages(serviceId, updated);

    toast({
      title: 'تم تعيين الصورة كغلاف رئيسي ⭐',
    });
  };

  // Move image position (reorder)
  const handleMoveImage = (serviceId: string, fromIndex: number, direction: 'left' | 'right') => {
    const currentService = servicesList.find(s => s.id === serviceId);
    if (!currentService) return;

    const currentImages = [...getAllImages(currentService)];
    // In RTL, "right" means towards earlier index (towards 0), "left" means towards later index
    const toIndex = direction === 'right' ? fromIndex - 1 : fromIndex + 1;

    if (toIndex < 0 || toIndex >= currentImages.length) return;

    // Swap elements
    const temp = currentImages[fromIndex];
    currentImages[fromIndex] = currentImages[toIndex];
    currentImages[toIndex] = temp;

    setAllImages(serviceId, currentImages);
  };

  // Text field handlers
  const handleShortDescChange = (serviceId: string, val: string) => {
    setServicesList(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, desc: val } : s))
    );
  };

  const handleDetailedDescChange = (serviceId: string, val: string) => {
    setServicesList(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, detailed_description: val } : s))
    );
  };

  // Save all changes to Supabase
  const handleSaveAll = async () => {
    try {
      await saveServices(servicesList);
      toast({
        title: 'تم الحفظ بنجاح ✅',
        description: 'تم تحديث صور وبيانات الخدمات في الموقع مباشرة.',
      });
    } catch (err: any) {
      toast({
        title: 'فشل الحفظ',
        description: err.message || 'حدث خطأ أثناء حفظ التعديلات',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      {/* 1. Header & Main Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">إدارة الخدمات الهندسية</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              تعديل الوصف المختصر، إضافة وصف تفصيلي، وإدارة الصور والمعارض (حتى 10 صور لكل خدمة).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <a
            href="/services"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
          >
            <ExternalLink className="h-4 w-4" />
            <span>معاينة صفحة الخدمات</span>
          </a>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ جميع التغييرات'}</span>
          </button>
        </div>
      </div>

      {/* 2. Guidelines Notice */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3 text-xs leading-relaxed text-foreground/80">
        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-primary">الميزات المتقدمة للخدمات:</span> يمكنك لكل خدمة تعديل الوصف المختصر، إضافة <strong>وصف تفصيلي موسع</strong>، ورفع <strong>حتى 10 صور</strong> (صورة الغلاف الرئيسي + حتى 9 صور إضافية للمعرض). الصور والوصف التفصيلي اختيارية؛ أي خدمة لا تحتوي على صور ستظل تظهر بتصميمها النصي الأصلي الأنيق.
        </div>
      </div>

      {/* 3. Services List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">جاري تحميل الخدمات...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {servicesList.map((service, index) => {
            const Icon = SERVICE_ICONS[service.iconName];
            const allImages = getAllImages(service);
            const totalCount = allImages.length;
            const isFull = totalCount >= MAX_IMAGES_PER_SERVICE;
            const isCurrentlyUploading = uploadingId === service.id;

            return (
              <div
                key={service.id}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-6"
              >
                {/* Service Card Top Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent text-primary-foreground shrink-0 shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-primary/80">
                          0{index + 1}
                        </span>
                        <h2 className="text-lg font-bold text-foreground">
                          {service.title}
                        </h2>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {service.id}
                      </p>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-2">
                    {/* Image Counter Badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold ${
                        totalCount === 0
                          ? 'bg-muted text-muted-foreground border border-border'
                          : isFull
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      }`}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>{totalCount} / {MAX_IMAGES_PER_SERVICE} صور</span>
                    </span>

                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewService(service)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      <span>معاينة</span>
                    </button>
                  </div>
                </div>

                {/* Text Fields: Short & Detailed Description */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Short Description */}
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      الوصف المختصر (يظهر في كارت الخدمة بالصفحة الرئيسية وصفحة الخدمات):
                    </label>
                    <textarea
                      rows={3}
                      value={service.desc}
                      onChange={(e) => handleShortDescChange(service.id, e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Detailed Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-foreground">
                        الوصف التفصيلي (يظهر عند فتح تفاصيل الخدمة):
                      </label>
                      <span className="text-[11px] text-muted-foreground">اختياري</span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="أدخل شرحاً هندسياً موسعاً للخدمة، خطوات العمل، الأجهزة المستخدمة، ومجالات التطبيق..."
                      value={service.detailed_description || ''}
                      onChange={(e) => handleDetailedDescChange(service.id, e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>

                {/* Images & Gallery Management */}
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        <span>معرض صور الخدمة ({totalCount} / {MAX_IMAGES_PER_SERVICE})</span>
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        الصورة الأولى هي <strong>صورة الغلاف الرئيسية</strong> للكارت. يمكنك إعادة الترتيب أو تعيين أي صورة كغلاف.
                      </p>
                    </div>

                    {isFull && (
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                        وصلت للحد الأقصى (10 صور)
                      </span>
                    )}
                  </div>

                  {/* Images Grid */}
                  {allImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {allImages.map((imgUrl, imgIdx) => {
                        const isMain = imgIdx === 0;

                        return (
                          <div
                            key={imgIdx}
                            className={`relative rounded-xl overflow-hidden border bg-card p-1 shadow-sm flex flex-col ${
                              isMain ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                            }`}
                          >
                            {/* Thumbnail */}
                            <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-muted">
                              <img
                                src={imgUrl}
                                alt={`صورة ${imgIdx + 1}`}
                                className="h-full w-full object-cover"
                              />

                              {/* Badge */}
                              <div className="absolute top-1 right-1">
                                {isMain ? (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-black text-primary-foreground shadow-sm">
                                    <Star className="h-2.5 w-2.5 fill-current" />
                                    غلاف
                                  </span>
                                ) : (
                                  <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                                    #{imgIdx + 1}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Control Bar */}
                            <div className="mt-2 flex items-center justify-between gap-1 px-1 pb-1">
                              {/* Reorder Buttons */}
                              <div className="flex items-center gap-0.5">
                                {/* Move Right (Towards 0 in RTL) */}
                                <button
                                  type="button"
                                  disabled={imgIdx === 0}
                                  onClick={() => handleMoveImage(service.id, imgIdx, 'right')}
                                  title="تقديم"
                                  className="h-6 w-6 rounded-md bg-muted/60 hover:bg-muted text-foreground flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none text-xs"
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </button>

                                {/* Move Left (Away from 0 in RTL) */}
                                <button
                                  type="button"
                                  disabled={imgIdx === allImages.length - 1}
                                  onClick={() => handleMoveImage(service.id, imgIdx, 'left')}
                                  title="تأخير"
                                  className="h-6 w-6 rounded-md bg-muted/60 hover:bg-muted text-foreground flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none text-xs"
                                >
                                  <ArrowLeft className="h-3 w-3" />
                                </button>

                                {/* Set as Main (if not already main) */}
                                {!isMain && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetAsMain(service.id, imgIdx)}
                                    title="تعيين كغلاف رئيسي"
                                    className="h-6 w-6 rounded-md bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center"
                                  >
                                    <Star className="h-3 w-3" />
                                  </button>
                                )}
                              </div>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImageByIndex(service.id, imgIdx)}
                                title="حذف الصورة"
                                className="h-6 w-6 rounded-md bg-destructive/10 hover:bg-destructive text-destructive hover:text-white flex items-center justify-center transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Upload & Add URL Controls */}
                  {!isFull ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      {/* Multiple Files Upload */}
                      <label className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm">
                        {isCurrentlyUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        <span>
                          {isCurrentlyUploading
                            ? 'جاري رفع الصور...'
                            : `رفع صور من جهازك (${MAX_IMAGES_PER_SERVICE - totalCount} متبقية)`}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={isCurrentlyUploading}
                          onChange={(e) => {
                            handleUploadImages(service.id, e.target.files);
                            e.target.value = '';
                          }}
                        />
                      </label>

                      <span className="text-xs text-muted-foreground whitespace-nowrap">أو بالرابط:</span>

                      {/* Add Image by URL */}
                      <div className="flex items-center gap-2 flex-1 w-full">
                        <input
                          type="url"
                          placeholder="https://... رابط صورة مباشرة"
                          value={urlInputs[service.id] || ''}
                          onChange={(e) =>
                            setUrlInputs(prev => ({ ...prev, [service.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddUrlImage(service.id);
                            }
                          }}
                          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddUrlImage(service.id)}
                          className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                        >
                          + إضافة
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border/80 bg-background/60 p-3 text-center text-xs text-muted-foreground">
                      وصلت الخدمة إلى الحد الأقصى للصور (10/10 صور). لإضافة صورة جديدة، قم بحذف إحدى الصور الحالية أولاً.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Bottom Save Button */}
      <div className="flex items-center justify-end border-t border-border/70 pt-6">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{isSaving ? 'جاري الحفظ...' : 'حفظ جميع التغييرات'}</span>
        </button>
      </div>

      {/* 5. Preview Modal */}
      {previewService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
          onClick={() => setPreviewService(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-7 text-foreground shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              type="button"
              onClick={() => setPreviewService(null)}
              className="absolute top-5 left-5 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
              معاينة مظهر الخدمة في الموقع:
            </h3>

            {/* Recreated Service Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card overflow-hidden">
              {previewService.image_url && (
                <div className="relative -mx-6 -mt-6 mb-5 aspect-[16/10] overflow-hidden bg-muted border-b border-border/60">
                  <img
                    src={previewService.image_url}
                    alt={previewService.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent text-primary-foreground">
                {(() => {
                  const PreviewIcon = (previewService.iconName && SERVICE_ICONS[previewService.iconName]) || Wrench;
                  return <PreviewIcon className="h-7 w-7" />;
                })()}
              </div>

              <h4 className="mb-2 text-lg font-bold text-foreground">{previewService.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{previewService.desc}</p>

              {previewService.detailed_description && (
                <div className="mt-4 pt-4 border-t border-border/60">
                  <p className="text-xs font-bold text-foreground mb-1">الوصف التفصيلي:</p>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {previewService.detailed_description}
                  </p>
                </div>
              )}

              {previewService.gallery_images && previewService.gallery_images.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/60">
                  <p className="text-xs font-bold text-foreground mb-2">
                    صور إضافية للمعرض ({previewService.gallery_images.length}):
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {previewService.gallery_images.map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                        <img src={img} alt={`معرض ${i + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
