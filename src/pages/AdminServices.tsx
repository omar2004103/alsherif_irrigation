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
  RefreshCw,
  Eye,
  X,
  AlertCircle
} from 'lucide-react';
import { useServicesData } from '@/hooks/useServicesData';
import { SERVICE_ICONS, ServiceItem } from '@/data/servicesData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminServices: React.FC = () => {
  const { toast } = useToast();
  const { services: remoteServices, isLoading, saveServices, isSaving } = useServicesData();

  // Local state for editing services
  const [servicesList, setServicesList] = useState<ServiceItem[]>(remoteServices);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [previewService, setPreviewService] = useState<ServiceItem | null>(null);

  // Sync remote services when loaded
  useEffect(() => {
    if (remoteServices && remoteServices.length > 0) {
      setServicesList(remoteServices);
    }
  }, [remoteServices]);

  // Upload file helper
  const handleUploadImage = async (serviceId: string, file: File) => {
    setUploadingId(serviceId);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `services/${serviceId}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update in local state
      setServicesList(prev =>
        prev.map(s => (s.id === serviceId ? { ...s, image_url: publicUrl } : s))
      );

      toast({
        title: 'تم رفع الصورة بنجاح 🖼️',
        description: 'اضغط "حفظ جميع التغييرات" لتثبيت التحديث على الموقع.',
      });
    } catch (err: any) {
      toast({
        title: 'فشل رفع الصورة',
        description: err.message || 'حدث خطأ أثناء رفع الصورة',
        variant: 'destructive',
      });
    } finally {
      setUploadingId(null);
    }
  };

  // Change image URL manually
  const handleUrlChange = (serviceId: string, url: string) => {
    setServicesList(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, image_url: url ? url.trim() : null } : s))
    );
  };

  // Remove image from service
  const handleRemoveImage = (serviceId: string) => {
    setServicesList(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, image_url: null } : s))
    );
    toast({
      title: 'تمت إزالة الصورة 🗑️',
      description: 'عادت الخدمة للشكل النصي الأصلي. اضغط "حفظ التغييرات" للتأكيد.',
    });
  };

  // Save changes to Supabase
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
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">إدارة الخدمات الهندسية</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              تخصيص صور اختيارية لخدمات الشركة الهندسية الثمانية المعروضة في صفحة الخدمات.
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

      {/* Info Notice Banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3 text-xs leading-relaxed text-foreground/80">
        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-primary">ملاحظة هامة:</span> إضافة الصورة لأي خدمة هي ميزة <strong>اختيارية تماماً</strong>. الخدمة التي لا تملك صورة ستظل تظهر بتصميمها النصي الأصلي الأنيق دون أي فراغات أو إطارات فارغة، بينما الخدمة التي تُرفع لها صورة سيتم عرض صورتها بشكل متناسق في أعلى كارت الخدمة.
        </div>
      </div>

      {/* Services List Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">جاري تحميل الخدمات...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {servicesList.map((service, index) => {
            const Icon = SERVICE_ICONS[service.iconName];
            const hasImage = Boolean(service.image_url);
            const isCurrentlyUploading = uploadingId === service.id;

            return (
              <div
                key={service.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Service Header Info */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent text-primary-foreground shrink-0 shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-primary/80">
                          0{index + 1}
                        </span>
                        <h3 className="text-base font-bold text-foreground">
                          {service.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {service.desc}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                      hasImage
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {hasImage ? 'مع صورة توضيحية' : 'نص فقط (بدون صورة)'}
                  </span>
                </div>

                {/* Image Section */}
                <div className="border-t border-border/70 pt-4 mt-auto">
                  {hasImage ? (
                    <div className="space-y-3">
                      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-muted border border-border group">
                        <img
                          src={service.image_url!}
                          alt={service.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewService(service)}
                            className="rounded-lg bg-card/90 text-foreground px-3 py-1.5 text-xs font-bold hover:bg-card shadow-sm flex items-center gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>معاينة الكارت</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        {/* Replace image file */}
                        <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors">
                          {isCurrentlyUploading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5 text-primary" />
                          )}
                          <span>{isCurrentlyUploading ? 'جاري الرفع...' : 'استبدال الصورة'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isCurrentlyUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadImage(service.id, file);
                              e.target.value = '';
                            }}
                          />
                        </label>

                        {/* Remove image */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(service.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>إزالة الصورة</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        {/* Direct File Upload */}
                        <label className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all">
                          {isCurrentlyUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          <span>{isCurrentlyUploading ? 'جاري الرفع...' : 'رفع صورة من جهازك'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isCurrentlyUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadImage(service.id, file);
                              e.target.value = '';
                            }}
                          />
                        </label>

                        <span className="text-[11px] text-muted-foreground">أو بالرابط:</span>

                        {/* Direct URL input */}
                        <input
                          type="url"
                          placeholder="https://..."
                          value={service.image_url || ''}
                          onChange={(e) => handleUrlChange(service.id, e.target.value)}
                          className="flex-1 w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Save Action */}
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

      {/* Card Preview Modal */}
      {previewService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setPreviewService(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-foreground shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              type="button"
              onClick={() => setPreviewService(null)}
              className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
              معاينة مظهر الكارت في الموقع:
            </h3>

            {/* Exact recreation of the Public Service Card */}
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
                {React.createElement(SERVICE_ICONS[previewService.iconName], { className: 'h-7 w-7' })}
              </div>
              <h4 className="mb-2 text-lg font-bold text-foreground">{previewService.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{previewService.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
