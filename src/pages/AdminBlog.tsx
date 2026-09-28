import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Search, ArrowRight, Save, 
  Upload, X, Image as ImageIcon, Sparkles, Globe, FileText, 
  Check, Calendar, User, ExternalLink, RefreshCw, AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBlogPosts } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { uploadFileToSupabase } from '@/services/storageService';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

interface PostForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  alt_text: string;
  meta_title: string;
  published: boolean;
  author_name: string;
}

const INITIAL_FORM: PostForm = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  image_url: '',
  alt_text: '',
  meta_title: '',
  published: true,
  author_name: 'فريق آل شريف',
};

// URL-safe Arabic & English slug generator
function generateSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, '-')
    .replace(/[^\w\u0621-\u064A0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper to strip HTML tags for plain text extraction
function stripHtmlTags(html: string): string {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

const AdminBlog: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = useBlogPosts();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isDragOver, setIsDragOver] = useState(false);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEdit = (post: any) => {
    setEditingId(post.id);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      image_url: post.image_url || '',
      alt_text: post.alt_text || post.title || '',
      meta_title: post.meta_title || post.title || '',
      published: Boolean(post.published),
      author_name: post.author_name || 'فريق آل شريف',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Title change with auto-slug generation if slug was pristine
  const handleTitleChange = (newTitle: string) => {
    setForm(prev => {
      const isAutoSlug = !prev.slug || prev.slug === generateSlug(prev.title);
      return {
        ...prev,
        title: newTitle,
        slug: isAutoSlug ? generateSlug(newTitle) : prev.slug,
        meta_title: !prev.meta_title || prev.meta_title === prev.title ? newTitle : prev.meta_title,
      };
    });
  };

  // Auto-extract excerpt from editor content
  const handleExtractExcerpt = () => {
    const plain = stripHtmlTags(form.content).trim();
    if (!plain) {
      toast({ title: 'تنبيه', description: 'المحتوى فارغ حالياً، يرجى كتابة المقال أولاً' });
      return;
    }
    const snippet = plain.slice(0, 155) + (plain.length > 155 ? '...' : '');
    setForm(prev => ({ ...prev, excerpt: snippet }));
    toast({ title: 'تم استخراج الملخص بنجاح ✨' });
  };

  // Featured Image Upload Handler
  const handleImageFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({ title: 'ملف غير صالح', description: 'يرجى اختيار ملف صورة (JPG, PNG, WebP)', variant: 'destructive' });
      return;
    }
    setUploadingImage(true);
    try {
      const { url } = await uploadFileToSupabase(file, 'blog-featured');
      setForm(prev => ({
        ...prev,
        image_url: url,
        alt_text: prev.alt_text || prev.title || file.name.split('.')[0],
      }));
      toast({ title: 'تم رفع الصورة البارزة بنجاح 🖼️' });
    } catch (err: any) {
      toast({ title: 'خطأ أثناء رفع الصورة', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Save handler with safe database retry for optional columns
  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'تنبيه', description: 'يرجى كتابة عنوان المقال', variant: 'destructive' });
      return;
    }
    if (!form.content.trim()) {
      toast({ title: 'تنبيه', description: 'يرجى كتابة محتوى المقال', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const safeSlug = form.slug.trim() || generateSlug(form.title) || `post-${Date.now().toString().slice(-6)}`;

    // Core payload compatible with base table
    const corePayload = {
      title: form.title.trim(),
      slug: safeSlug,
      content: form.content,
      excerpt: form.excerpt.trim(),
      image_url: form.image_url.trim() || null,
      published: form.published,
      author_name: form.author_name.trim() || 'فريق آل شريف',
      updated_at: new Date().toISOString(),
    };

    // Extended payload with SEO & alt_text if columns exist
    const fullPayload = {
      ...corePayload,
      meta_title: form.meta_title.trim() || form.title.trim(),
      meta_description: form.excerpt.trim(),
      alt_text: form.alt_text.trim() || form.title.trim(),
    };

    try {
      if (editingId) {
        let { error } = await supabase.from('blog_posts').update(fullPayload as any).eq('id', editingId);
        if (error) {
          console.warn('Update failed with full payload, retrying with core payload:', error);
          const res = await supabase.from('blog_posts').update(corePayload as any).eq('id', editingId);
          if (res.error) throw res.error;
        }
        toast({
          title: 'تم تحديث المقال بنجاح ✨',
          description: `الرابط: /blog/${safeSlug}`,
        });
      } else {
        let { error } = await supabase.from('blog_posts').insert([fullPayload as any]);
        if (error) {
          console.warn('Insert failed with full payload, retrying with core payload:', error);
          const res = await supabase.from('blog_posts').insert([corePayload as any]);
          if (res.error) throw res.error;
        }
        toast({
          title: 'تمت إضافة ونشر المقال بنجاح 🎉',
          description: `الرابط: /blog/${safeSlug}`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      resetForm();
    } catch (err: any) {
      console.error('Error saving blog post:', err);
      toast({ title: 'خطأ أثناء الحفظ', description: err.message || 'يرجى المحاولة مجدداً', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, postTitle: string) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف المقال: "${postTitle}"؟`)) return;
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      toast({ title: 'تم حذف المقال بنجاح 🗑️' });
    } catch (err: any) {
      toast({ title: 'خطأ في الحذف', description: err.message, variant: 'destructive' });
    }
  };

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    try {
      const { error } = await supabase.from('blog_posts').update({ published: !currentPublished }).eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      toast({ title: !currentPublished ? 'تم نشر المقال 🚀' : 'تم تحويل المقال إلى مسودة 🔒' });
    } catch (err: any) {
      toast({ title: 'خطأ في تغيير الحالة', description: err.message, variant: 'destructive' });
    }
  };

  // Filtered posts for list view
  const filteredPosts = useMemo(() => {
    return (posts || []).filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          (p.excerpt && p.excerpt.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' 
        ? true 
        : statusFilter === 'published' 
          ? p.published 
          : !p.published;
      return matchSearch && matchStatus;
    });
  }, [posts, search, statusFilter]);

  // SEO Counters & Badges
  const metaTitleCount = form.meta_title.length;
  const metaDescCount = form.excerpt.length;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* View 1: Post Create / Edit Full Form */}
      {showForm ? (
        <div className="space-y-6">
          
          {/* Top Sticky Form Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="العودة لقائمة المقالات"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-xl font-black text-foreground">
                  {editingId ? 'تعديل المقال' : 'كتابة مقال جديد'}
                </h1>
                <p className="text-xs text-muted-foreground">لوحة التحكم / المدونة / {editingId ? 'تعديل' : 'إضافة مقال'}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {editingId && (
                <a
                  href={`/blog/${encodeURIComponent(form.slug || editingId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 text-primary bg-primary/10 px-3.5 py-2 text-xs font-bold hover:bg-primary hover:text-white transition-all"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> معاينة في الموقع ↗
                </a>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-button hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'جاري الحفظ...' : editingId ? 'تحديث المقال' : 'حفظ المقال'}</span>
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" /> إلغاء
              </button>
            </div>
          </div>

          {/* Form Grid Layout */}
          <div className="grid gap-6 lg:grid-cols-12">
            
            {/* Main Column: Content Editor & Title (8 cols) */}
            <div className="space-y-6 lg:col-span-8">
              
              {/* Title & Slug Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">
                    عنوان المقال <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="مثال: أفضل طرق تصميم شبكات الري بالتنقيط للأراضي الصحراوية..."
                    className="w-full rounded-2xl border border-input bg-background py-3 px-4 text-base sm:text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>

                {/* Permanent URL Preview & Input */}
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden text-muted-foreground">
                    <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-semibold shrink-0">الرابط الدائم:</span>
                    <span className="truncate text-foreground font-mono text-[11px]" dir="ltr">
                      /blog/{form.slug || '...'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, slug: generateSlug(prev.title) }))}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline shrink-0"
                  >
                    <RefreshCw className="h-3 w-3" /> توليد من العنوان
                  </button>
                </div>
              </div>

              {/* Rich Text Editor Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <FileText className="h-4 w-4" /> محتوى المقال التفاعلي
                  </div>
                  <span className="text-[11px] text-muted-foreground">محرر غني يدعم الصور، العناوين، الروابط والتنسيق الكامل</span>
                </div>

                <RichTextEditor
                  content={form.content}
                  onChange={html => setForm(prev => ({ ...prev, content: html }))}
                  placeholder="ابدأ بكتابة فقرات المقال هنا، يمكنك إضافة عناوين فرعية H2/H3 وقوائم وصور داخل النص..."
                />
              </div>

              {/* Excerpt & Meta Description Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <span>الملخص ووصف السيو (Meta Description)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      metaDescCount > 160 
                        ? 'bg-rose-500/10 text-rose-600' 
                        : metaDescCount >= 120 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {metaDescCount} / 160 حرفاً
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleExtractExcerpt}
                    className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> استخراج تلقائي
                  </button>
                </div>

                <textarea
                  value={form.excerpt}
                  onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  placeholder="اكتب ملخصاً جذاباً للمقال (سيظهر في بطاقة المدونة ووصف محرك بحث جوجل)..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed resize-none"
                />
                <p className="text-[11px] text-muted-foreground leading-normal">
                  * يفضل ألا يتجاوز الوصف 160 حرفاً حتى لا تقتطعه جوجل في نتائج البحث.
                </p>
              </div>

            </div>

            {/* Sidebar Column: Publishing, Image, SEO (4 cols) */}
            <div className="space-y-6 lg:col-span-4">
              
              {/* Card 1: حالة النشر والمؤلف */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-foreground border-b border-border/50 pb-3 flex items-center justify-between">
                  <span>إعدادات النشر</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    form.published ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'
                  }`}>
                    {form.published ? 'جاهز للنشر' : 'مسودة غير منشورة'}
                  </span>
                </h3>

                <div className="space-y-3 text-xs">
                  {/* Publish Switch */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-accent/20 cursor-pointer hover:bg-accent/40 transition-colors">
                    <span className="font-bold text-foreground">نشر المقال فوراً على الموقع</span>
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={e => setForm(prev => ({ ...prev, published: e.target.checked }))}
                      className="h-4 w-4 rounded accent-primary cursor-pointer"
                    />
                  </label>

                  {/* Author Name */}
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">اسم الكاتب / المؤلف</label>
                    <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        value={form.author_name}
                        onChange={e => setForm(prev => ({ ...prev, author_name: e.target.value }))}
                        placeholder="فريق آل شريف للري الحديث"
                        className="w-full bg-transparent text-xs text-foreground outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: الصورة البارزة (Featured Image) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <ImageIcon className="h-4 w-4" /> الصورة البارزة (Featured Image)
                  </div>
                </div>

                {form.image_url ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-muted/30 group shadow-sm">
                      <img
                        src={form.image_url}
                        alt={form.alt_text || form.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
                        className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-xl bg-rose-600/90 text-white shadow-md hover:bg-rose-700 transition-all cursor-pointer"
                        title="حذف الصورة"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="replace-featured-img" className="text-xs font-bold text-primary hover:underline cursor-pointer">
                        تغيير الصورة ↻
                        <input
                          id="replace-featured-img"
                          type="file"
                          accept="image/*"
                          onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
                        className="text-xs text-destructive hover:underline"
                      >
                        إزالة الصورة
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                      isDragOver
                        ? 'border-primary bg-primary/10 scale-98'
                        : 'border-border bg-accent/20 hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="mx-auto h-8 w-8 text-primary/70 mb-2" />
                    <p className="text-xs font-bold text-foreground">اسحب وأفلت الصورة البارزة هنا</p>
                    <p className="text-[10px] text-muted-foreground mt-1">أو اضغط لاختيار صورة من جهازك (JPG, PNG, WebP)</p>
                    {uploadingImage && (
                      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-primary font-bold">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> جاري رفع الصورة...
                      </div>
                    )}
                  </div>
                )}

                {/* Direct Image URL input */}
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">أو ضع رابط صورة مباشر:</label>
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-input bg-background p-2 text-xs outline-none"
                    dir="ltr"
                  />
                </div>

                {/* Alt Text Input for Google SEO */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    النص البديل للصورة (Alt Text) 🔍
                  </label>
                  <input
                    type="text"
                    value={form.alt_text}
                    onChange={e => setForm(prev => ({ ...prev, alt_text: e.target.value }))}
                    placeholder="وصف دقيق لمحتوى الصورة لمحركات البحث..."
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    يساعد محرك بحث Google Images في أرشفة وفهم صور المقال.
                  </p>
                </div>
              </div>

              {/* Card 3: إعدادات الـ SEO ومعاينة جوجل (SERP Preview) */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Globe className="h-4 w-4" /> إعدادات السيو (SEO Settings)
                  </div>
                </div>

                {/* Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-foreground">عنوان السيو (Meta Title)</label>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      metaTitleCount > 60
                        ? 'bg-rose-500/10 text-rose-600'
                        : metaTitleCount >= 40
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {metaTitleCount} / 60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.meta_title}
                    onChange={e => setForm(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="العنوان الذي يظهر في نتائج بحث جوجل..."
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Slug Input */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">الرابط الدائم (Slug)</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => setForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                    placeholder="drip-irrigation-system"
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    dir="ltr"
                  />
                </div>

                {/* Live Google SERP Snippet Preview */}
                <div className="rounded-xl border border-border/80 bg-accent/20 p-3 space-y-1.5 text-right" dir="rtl">
                  <span className="text-[10px] font-bold text-primary block border-b border-border/40 pb-1">
                    معاينة النتيجة في محرك بحث Google
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                    <span className="h-3.5 w-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-bold">ش</span>
                    <span className="truncate" dir="ltr">alsherif-irrigation.com › blog › {form.slug || 'slug'}</span>
                  </div>
                  <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline line-clamp-1 cursor-pointer">
                    {form.meta_title || form.title || 'عنوان المقال سيظهر هنا'}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {form.excerpt || 'ملخص المقال ووصف السيو سيظهر هنا في صفحات نتائج البحث...'}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* View 2: Blog Posts List Table / Cards */
        <div className="space-y-6">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-foreground">إدارة المدونة والمقالات</h1>
              <p className="text-xs text-muted-foreground mt-1">
                إضافة وتحرير مقالات شبكات الري، مع محرر غني ودعم كامل للـ SEO والصور.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-button hover:opacity-90 transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" /> كتابة مقال جديد
            </button>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث في المقالات..."
                className="w-full rounded-xl border border-input bg-background pr-9 pl-4 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {(['all', 'published', 'draft'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    statusFilter === st
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'border border-border bg-background text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {st === 'all' ? 'الكل' : st === 'published' ? 'المنشورة' : 'المسودات'}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid / Cards */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-2xl border border-border bg-card/60 animate-pulse" />
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid gap-4">
              {filteredPosts.map(post => (
                <div
                  key={post.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="h-18 w-24 sm:h-20 sm:w-28 rounded-xl overflow-hidden bg-muted/30 border border-border shrink-0 flex items-center justify-center">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                      )}
                    </div>

                    {/* Post Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          post.published ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          {post.published ? 'منشور علناً' : 'مسودة'}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono" dir="ltr">/blog/{post.slug}</span>
                      </div>
                      <h3 className="font-bold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-xl">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                        <span>{new Date(post.created_at).toLocaleDateString('ar-EG')}</span>
                        <span>•</span>
                        <span>{post.author_name || 'فريق آل شريف'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <a
                      href={`/blog/${encodeURIComponent(post.slug)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      title="معاينة في الموقع"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleTogglePublish(post.id, post.published)}
                      className={`rounded-xl border border-border p-2 transition-colors ${
                        post.published ? 'text-emerald-600 hover:bg-amber-500/10 hover:text-amber-600' : 'text-amber-600 hover:bg-emerald-500/10 hover:text-emerald-600'
                      }`}
                      title={post.published ? 'تحويل إلى مسودة' : 'نشر المقال'}
                    >
                      {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(post)}
                      className="rounded-xl bg-accent border border-border p-2 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      title="تعديل المقال"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(post.id, post.title)}
                      className="rounded-xl border border-rose-500/30 p-2 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                      title="حذف المقال"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <h3 className="text-base font-bold text-foreground">لا توجد مقالات مطابقة</h3>
              <p className="text-xs text-muted-foreground">ابدأ بكتابة أول مقال زراعي وهندسي في مدونة آل شريف للري الحديث.</p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-button"
              >
                <Plus className="h-4 w-4" /> كتابة مقال الآن
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminBlog;
