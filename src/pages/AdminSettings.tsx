import { useState, useEffect, useRef } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Save, Building2, Phone, Share2, Image as ImageIcon, Search, Home, Layers, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Field = { key: string; label: string; type?: 'text' | 'textarea' | 'url' | 'image' | 'tel'; placeholder?: string; help?: string };

type Tab = { id: string; label: string; icon: any; fields: Field[] };

const TABS: Tab[] = [
  {
    id: 'company', label: 'الشركة', icon: Building2,
    fields: [
      { key: 'company_name_ar', label: 'اسم الشركة (عربي)' },
      { key: 'company_name_en', label: 'اسم الشركة (إنجليزي)' },
      { key: 'company_tagline', label: 'الشعار / Tagline' },
      { key: 'company_description', label: 'وصف الشركة', type: 'textarea' },
      { key: 'footer_about', label: 'نبذة الفوتر', type: 'textarea' },
    ],
  },
  {
    id: 'branding', label: 'الشعار والفافيكون', icon: ImageIcon,
    fields: [
      { key: 'logo_url', label: 'شعار الشركة (Logo)', type: 'image', help: 'يُستخدم في الهيدر والفوتر' },
      { key: 'favicon_url', label: 'أيقونة المتصفح (Favicon)', type: 'image', help: 'يفضّل PNG مربّع 64×64' },
    ],
  },
  {
    id: 'contact', label: 'التواصل والعنوان', icon: Phone,
    fields: [
      { key: 'phone1', label: 'الهاتف 1', type: 'tel' },
      { key: 'phone1_label', label: 'وصف الهاتف 1' },
      { key: 'phone2', label: 'الهاتف 2', type: 'tel' },
      { key: 'phone2_label', label: 'وصف الهاتف 2' },
      { key: 'whatsapp', label: 'رقم واتساب (دولي بدون +)', type: 'tel', placeholder: '201028200048' },
      { key: 'admin_phone', label: 'هاتف الأدمن (داخلي)', type: 'tel' },
      { key: 'email', label: 'البريد الإلكتروني الأساسي' },
      { key: 'email2', label: 'بريد إضافي' },
      { key: 'address', label: 'العنوان الكامل', type: 'textarea' },
      { key: 'postal_code', label: 'الرمز البريدي' },
      { key: 'plus_code', label: 'Plus Code' },
      { key: 'hours', label: 'ساعات العمل' },
      { key: 'hours_off', label: 'يوم الإجازة' },
      { key: 'google_map_embed', label: 'رابط تضمين خرائط جوجل (embed)', type: 'url', help: 'رابط src من iframe خرائط جوجل' },
      { key: 'google_map_link', label: 'رابط فتح الخريطة', type: 'url' },
    ],
  },
  {
    id: 'social', label: 'التواصل الاجتماعي', icon: Share2,
    fields: [
      { key: 'social_facebook', label: 'Facebook', type: 'url' },
      { key: 'social_instagram', label: 'Instagram', type: 'url' },
      { key: 'social_youtube', label: 'YouTube', type: 'url' },
      { key: 'social_linkedin', label: 'LinkedIn', type: 'url' },
      { key: 'social_x', label: 'X (Twitter)', type: 'url' },
      { key: 'social_tiktok', label: 'TikTok', type: 'url' },
    ],
  },
  {
    id: 'homepage', label: 'الصفحة الرئيسية', icon: Home,
    fields: [
      { key: 'hero_badge', label: 'شارة البطل (Badge)' },
      { key: 'hero_title', label: 'عنوان البطل — سطر 1' },
      { key: 'hero_title_accent', label: 'عنوان البطل — سطر 2 (مميز)' },
      { key: 'hero_subtitle', label: 'العنوان الفرعي', type: 'textarea' },
    ],
  },
  {
    id: 'stats', label: 'الإحصائيات', icon: Layers,
    fields: [
      { key: 'stats_years', label: 'سنوات الخبرة', placeholder: '+25' },
      { key: 'stats_projects', label: 'مشاريع منفذة', placeholder: '+500' },
      { key: 'stats_governorates', label: 'محافظات نغطيها', placeholder: '18' },
      { key: 'stats_clients', label: 'عملاء فعّالين', placeholder: '+2,400' },
    ],
  },
  {
    id: 'seo', label: 'SEO', icon: Search,
    fields: [
      { key: 'seo_title', label: 'عنوان الموقع (Title)' },
      { key: 'seo_description', label: 'الوصف (Description)', type: 'textarea' },
      { key: 'seo_keywords', label: 'الكلمات المفتاحية', type: 'textarea' },
    ],
  },
];

const AdminSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [active, setActive] = useState('company');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const { data: dbSettings } = useQuery({
    queryKey: ['site_settings_all'],
    queryFn: async () => {
      const { data } = await supabase.from('site_settings').select('*');
      return data || [];
    },
  });

  useEffect(() => {
    if (dbSettings) {
      const merged: Record<string, string> = {};
      dbSettings.forEach((s: any) => { merged[s.key] = s.value ?? ''; });

      // Default to verified official Google Maps location if empty or outdated
      if (!merged.google_map_embed || merged.google_map_embed.includes('P726')) {
        merged.google_map_embed = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3434.331!2d30.2617714!3d30.7021432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458a9196d930b5b%3A0xeee0d144d3ad9d13!2z2LTYsdmD2Kkg2KfZhCDYtNix2YrZgSDZhNmE2LHZiiDYp9mE2K3Yr9mK2Kw!5e0!3m2!1sar!2seg!4v1726788800000!5m2!1sar!2seg';
      }
      if (!merged.google_map_link || merged.google_map_link === '#' || merged.google_map_link.includes('P726')) {
        merged.google_map_link = 'https://maps.app.goo.gl/MJSzM41LFD4UCEhf8';
      }

      setSettings(merged);
    }
  }, [dbSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const rows = Object.entries(settings).map(([key, value]) => ({ key, value: value ?? '' }));
      // upsert in batches
      const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['site_settings'] });
      queryClient.invalidateQueries({ queryKey: ['site_settings_all'] });
      toast({ title: 'تم الحفظ ✅', description: 'تم تحديث إعدادات الموقع' });
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message || 'تعذر الحفظ', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (key: string, file: File) => {
    setUploading(key);
    try {
      const ext = file.name.split('.').pop();
      const path = `site/${key}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      setSettings(prev => ({ ...prev, [key]: data.publicUrl }));
      toast({ title: 'تم الرفع', description: 'اضغط "حفظ" لتثبيت التغيير' });
    } catch (e: any) {
      toast({ title: 'خطأ في الرفع', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(null);
    }
  };

  const currentTab = TABS.find(t => t.id === active)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إعدادات الموقع</h1>
          <p className="text-sm text-muted-foreground mt-1">تحكم كامل في محتوى وبيانات الموقع من مكان واحد</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-button transition-transform hover:scale-105 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-border bg-card p-2 shadow-card h-fit sticky top-4">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button key={tab.id} onClick={() => setActive(tab.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-primary text-primary-foreground shadow-button' : 'text-foreground/70 hover:bg-accent hover:text-foreground'}`}>
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </aside>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
            <currentTab.icon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">{currentTab.label}</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {currentTab.fields.map(field => {
              const value = settings[field.key] || '';
              const spanFull = field.type === 'textarea' || field.type === 'image';

              if (field.type === 'image') {
                return (
                  <div key={field.key} className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">{field.label}</label>
                    {field.help && <p className="text-xs text-muted-foreground mb-2">{field.help}</p>}
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 flex-shrink-0 rounded-xl border border-border bg-accent/30 flex items-center justify-center overflow-hidden">
                        {value ? (
                          <img src={value} alt={field.label} className="h-full w-full object-contain" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input type="url" value={value} onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                          placeholder="رابط الصورة أو ارفع ملف"
                          dir="ltr"
                          className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                        <input ref={el => (fileInputs.current[field.key] = el)} type="file" accept="image/*" className="hidden"
                          onChange={e => e.target.files?.[0] && handleImageUpload(field.key, e.target.files[0])} />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => fileInputs.current[field.key]?.click()} disabled={uploading === field.key}
                            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-50">
                            {uploading === field.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                            رفع صورة
                          </button>
                          {value && (
                            <button type="button" onClick={() => setSettings({ ...settings, [field.key]: '' })}
                              className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10">
                              إزالة
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.key} className={spanFull ? 'sm:col-span-2' : ''}>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea value={value} onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                      rows={3} placeholder={field.placeholder}
                      className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  ) : (
                    <input type={field.type === 'tel' ? 'tel' : field.type === 'url' ? 'url' : 'text'}
                      value={value} onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      dir={field.type === 'tel' || field.type === 'url' ? 'ltr' : undefined}
                      className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  )}
                  {field.help && <p className="text-xs text-muted-foreground mt-1.5">{field.help}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3 text-sm">
        <div className="text-primary text-lg">💡</div>
        <div className="text-foreground/80 leading-relaxed">
          <b className="text-foreground">تلميح:</b> جميع البيانات (الشعار، الفافيكون، الهواتف، العناوين، الصفحة الرئيسية، SEO، وسائل التواصل) تُحفظ في قاعدة البيانات ويتم قراءتها تلقائيًا في الموقع بدون تعديل أي كود.
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
