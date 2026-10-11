import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Upload,
  X,
  Check,
  MapPin,
  Layers,
  Wrench,
  FileText,
  Image as ImageIcon,
  Save,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useProjectsData } from '@/hooks/useProjectsData';
import {
  ProjectItem,
  ProjectCategory,
  PROJECT_CATEGORIES
} from '@/data/projectsData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import heroImg from '@/assets/hero-irrigation.jpg';

interface ProjectFormData {
  title: string;
  slug: string;
  category: ProjectCategory;
  location: string;
  systemType: string;
  summary: string;
  description: string;
  scopeOfWork: string[];
  components: string[];
  coverImage: string;
  gallery: string[];
  featured: boolean;
}

const INITIAL_FORM: ProjectFormData = {
  title: '',
  slug: '',
  category: 'شبكات الري بالتنقيط',
  location: '',
  systemType: '',
  summary: '',
  description: '',
  scopeOfWork: [],
  components: [],
  coverImage: '',
  gallery: [],
  featured: false,
};

// URL-safe Arabic and English slug generator
function generateSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, '-')
    .replace(/[^\w\u0621-\u064A0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const AdminProjects: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const {
    projects,
    isLoading,
    addProject,
    updateProject,
    deleteProject,
    isSaving
  } = useProjectsData();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectFormData>(INITIAL_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('الكل');

  // Input states for dynamic array items in form
  const [newScopeItem, setNewScopeItem] = useState('');
  const [newComponentItem, setNewComponentItem] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // If URL has ?new=1, open the creation modal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === '1') {
      handleOpenAdd();
    }
  }, [location.search]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setNewScopeItem('');
    setNewComponentItem('');
    setNewGalleryUrl('');
    setShowModal(true);
  };

  const handleOpenEdit = (project: ProjectItem) => {
    setEditingId(project.id);
    setForm({
      title: project.title,
      slug: project.slug,
      category: project.category,
      location: project.location,
      systemType: project.systemType,
      summary: project.summary,
      description: project.description,
      scopeOfWork: [...project.scopeOfWork],
      components: [...project.components],
      coverImage: project.coverImage,
      gallery: [...(project.gallery || [])],
      featured: Boolean(project.featured),
    });
    setNewScopeItem('');
    setNewComponentItem('');
    setNewGalleryUrl('');
    setShowModal(true);
  };

  const handleTitleChange = (val: string) => {
    setForm(prev => ({
      ...prev,
      title: val,
      slug: prev.slug === '' || prev.slug === generateSlug(prev.title) ? generateSlug(val) : prev.slug,
    }));
  };

  // Add scope item
  const handleAddScope = () => {
    if (!newScopeItem.trim()) return;
    setForm(prev => ({ ...prev, scopeOfWork: [...prev.scopeOfWork, newScopeItem.trim()] }));
    setNewScopeItem('');
  };

  // Remove scope item
  const handleRemoveScope = (index: number) => {
    setForm(prev => ({
      ...prev,
      scopeOfWork: prev.scopeOfWork.filter((_, i) => i !== index),
    }));
  };

  // Add component item
  const handleAddComponent = () => {
    if (!newComponentItem.trim()) return;
    setForm(prev => ({ ...prev, components: [...prev.components, newComponentItem.trim()] }));
    setNewComponentItem('');
  };

  // Remove component item
  const handleRemoveComponent = (index: number) => {
    setForm(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }));
  };

  // Add gallery image by URL
  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setForm(prev => ({ ...prev, gallery: [...prev.gallery, newGalleryUrl.trim()] }));
    setNewGalleryUrl('');
  };

  // Remove gallery image
  const handleRemoveGalleryImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  // Upload file helper
  const uploadImageFile = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `projects/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Upload Cover Image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const publicUrl = await uploadImageFile(file);
      setForm(prev => ({
        ...prev,
        coverImage: publicUrl,
        gallery: prev.gallery.length === 0 ? [publicUrl] : prev.gallery,
      }));
      toast({ title: 'تم رفع الصورة بنجاح ✅' });
    } catch (err: any) {
      toast({ title: 'فشل الرفع', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  // Upload Additional Gallery Image
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImageFile(files[i]);
        urls.push(url);
      }
      setForm(prev => ({ ...prev, gallery: [...prev.gallery, ...urls] }));
      toast({ title: `تم رفع ${urls.length} صورة للمعرض بنجاح ✅` });
    } catch (err: any) {
      toast({ title: 'فشل رفع الصور', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  // Submit Add or Edit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: 'تنبيه', description: 'يرجى كتابة عنوان المشروع', variant: 'destructive' });
      return;
    }

    try {
      const slugVal = form.slug.trim() || generateSlug(form.title);
      const coverVal = form.coverImage.trim() || heroImg;
      const galleryVal = form.gallery.length > 0 ? form.gallery : [coverVal];

      if (editingId) {
        // Edit existing project
        await updateProject(editingId, {
          title: form.title.trim(),
          slug: slugVal,
          category: form.category,
          location: form.location.trim() || 'مصر',
          systemType: form.systemType.trim(),
          summary: form.summary.trim(),
          description: form.description.trim(),
          scopeOfWork: form.scopeOfWork,
          components: form.components,
          coverImage: coverVal,
          gallery: galleryVal,
          featured: form.featured,
        });
        toast({ title: 'تم التعديل بنجاح ✅', description: `تم تحديث مشروع "${form.title}"` });
      } else {
        // Create new project
        const newProj: ProjectItem = {
          id: `proj-${Date.now()}`,
          title: form.title.trim(),
          slug: slugVal,
          category: form.category,
          location: form.location.trim() || 'مصر',
          systemType: form.systemType.trim(),
          summary: form.summary.trim(),
          description: form.description.trim(),
          scopeOfWork: form.scopeOfWork,
          components: form.components,
          coverImage: coverVal,
          gallery: galleryVal,
          featured: form.featured,
        };
        await addProject(newProj);
        toast({ title: 'تمت الإضافة بنجاح ✅', description: `تمت إضافة مشروع "${form.title}"` });
      }

      setShowModal(false);
      setEditingId(null);
      setForm(INITIAL_FORM);
    } catch (err: any) {
      toast({ title: 'خطأ أثناء الحفظ', description: err.message, variant: 'destructive' });
    }
  };

  // Delete project confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteProject(deleteConfirmId);
      toast({ title: 'تم الحذف بنجاح 🗑️', description: 'تم حذف المشروع من قائمة المشروعات' });
      setDeleteConfirmId(null);
    } catch (err: any) {
      toast({ title: 'فشل الحذف', description: err.message, variant: 'destructive' });
    }
  };

  // Filter projects by search and category
  const filteredProjects = projects.filter(p => {
    const matchesCategory = categoryFilter === 'الكل' || p.category === categoryFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.systemType.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FolderKanban className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">إدارة المشروعات الهندسية</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              إضافة، تعديل، وحذف مشروعات الري وسابقة الأعمال الميدانية المنفذة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <a
            href="/projects"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
          >
            <ExternalLink className="h-4 w-4" />
            <span>معاينة صفحة المشاريع</span>
          </a>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة مشروع جديد</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Stat Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold">إجمالي المشروعات</p>
          <p className="text-2xl font-black text-foreground mt-1">{projects.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold">المشروعات المميزة</p>
          <p className="text-2xl font-black text-primary mt-1">
            {projects.filter(p => p.featured).length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold">أقسام الري</p>
          <p className="text-2xl font-black text-secondary-foreground mt-1">
            {PROJECT_CATEGORIES.length - 1}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold">حالة الحفظ السحابي</p>
          <div className="flex items-center gap-1.5 mt-1 text-emerald-600 font-bold text-sm">
            <Check className="h-4 w-4" />
            <span>متصل بـ Supabase</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ابحث بالاسم، المحافظة، أو النظام..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pr-9 pl-4 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">التصنيف:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
          >
            {PROJECT_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Projects Table / Cards List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">جاري تحميل قائمة المشروعات...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <FolderKanban className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">لا توجد مشاريع تطابق البحث</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            {search ? 'جرّب تغيير كلمات البحث أو مسح الفلتر' : 'ابدأ بإضافة أول مشروع هندسي لسجل الشركة.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة مشروع جديد الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Cover Photo & Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="relative aspect-[16/10] w-28 sm:w-36 shrink-0 rounded-xl overflow-hidden bg-muted border border-border">
                  <img
                    src={project.coverImage || heroImg}
                    alt={project.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = heroImg;
                    }}
                  />
                  {project.featured && (
                    <span className="absolute top-1.5 right-1.5 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-extrabold text-secondary-foreground shadow-sm">
                      مميز
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-primary/10 text-primary px-2.5 py-0.5 text-[11px] font-bold">
                      {project.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                      <MapPin className="h-3 w-3 text-primary" />
                      {project.location}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      · {project.gallery?.length || 1} صور
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-foreground leading-snug">
                    {project.title}
                  </h3>

                  <p className="text-xs text-primary/90 font-semibold flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span>{project.systemType}</span>
                  </p>

                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-2xl">
                    {project.summary}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border/60">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(project)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                >
                  <Edit className="h-3.5 w-3.5 text-primary" />
                  <span>تعديل</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(project.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. ADD / EDIT PROJECT MODAL DIALOG */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-8 text-foreground shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/70 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {editingId ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground">
                    {editingId ? 'تعديل بيانات المشروع' : 'إضافة مشروع هندسي جديد'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    املأ البيانات والمواصفات الفنية الميدانية للمشروع.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Title & Slug */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    عنوان المشروع <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: شبكة ري بالتنقيط لبساتين موالح"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    الرابط الدائم (Slug)
                  </label>
                  <input
                    type="text"
                    placeholder="drip-irrigation-citrus"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Row 2: Category & Location */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    التصنيف الهندسي <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as ProjectCategory }))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                  >
                    {PROJECT_CATEGORIES.filter(c => c.id !== 'الكل').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    الموقع والمحافظة <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: قطاع غرب النوبارية، البحيرة"
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: System Type */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  نوع النظام الهيدروليكي
                </label>
                <input
                  type="text"
                  placeholder="مثال: شبكة ري موضعي بالتنقيط مع نقاطات GR معوضة للضغط"
                  value={form.systemType}
                  onChange={(e) => setForm(prev => ({ ...prev, systemType: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Row 4: Summary */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  ملخص فني سريع (يظهر في كارت المشروع)
                </label>
                <textarea
                  rows={2}
                  placeholder="سطران يصفان طبيعة المشروع وأهدافه..."
                  value={form.summary}
                  onChange={(e) => setForm(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Row 5: Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  الوصف الهندسي التفصيلي للمشروع
                </label>
                <textarea
                  rows={4}
                  placeholder="شرح كامل للحلول الهندسية المنفذة..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Row 6: Scope of Work (Dynamic List) */}
              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <label className="block text-xs font-bold text-foreground mb-2">
                  نطاق العمل والتنفيذ الميداني (Scope of Work):
                </label>

                {form.scopeOfWork.length > 0 && (
                  <ul className="space-y-2 mb-3">
                    {form.scopeOfWork.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-center justify-between gap-2 rounded-lg bg-card border border-border px-3 py-1.5 text-xs">
                        <span>{sIdx + 1}. {step}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveScope(sIdx)}
                          className="text-destructive hover:opacity-80 p-1"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="أدخل بنداً في نطاق العمل (مثال: حفر وتمديد خطوط المواسير الرئيسية)"
                    value={newScopeItem}
                    onChange={(e) => setNewScopeItem(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddScope(); } }}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddScope}
                    className="rounded-xl bg-primary/10 text-primary px-3 py-2 text-xs font-bold hover:bg-primary/20"
                  >
                    + إضافة بند
                  </button>
                </div>
              </div>

              {/* Row 7: Components (Dynamic Badges) */}
              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <label className="block text-xs font-bold text-foreground mb-2">
                  المكونات والمستلزمات الموردة:
                </label>

                {form.components.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.components.map((comp, cIdx) => (
                      <span key={cIdx} className="inline-flex items-center gap-1.5 rounded-lg bg-card border border-border px-2.5 py-1 text-xs font-medium">
                        <span>{comp}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(cIdx)}
                          className="text-destructive hover:opacity-80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="مثال: خراطيم جي آر 16 مم أو محابس هواء أوتوماتيكية"
                    value={newComponentItem}
                    onChange={(e) => setNewComponentItem(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComponent(); } }}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddComponent}
                    className="rounded-xl bg-primary/10 text-primary px-3 py-2 text-xs font-bold hover:bg-primary/20"
                  >
                    + إضافة مكون
                  </button>
                </div>
              </div>

              {/* Row 8: Cover Image Upload */}
              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <label className="block text-xs font-bold text-foreground mb-2">
                  الصورة البارزة للمشروع (Cover Image):
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {form.coverImage ? (
                    <div className="relative aspect-[16/10] w-36 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
                      <img src={form.coverImage} alt="معاينة الغلاف" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, coverImage: '' }))}
                        className="absolute top-1 left-1 rounded-full bg-black/70 p-1 text-white hover:bg-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-24 w-36 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-card text-muted-foreground text-xs">
                      لا توجد صورة
                    </div>
                  )}

                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all">
                        {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        <span>{uploadingCover ? 'جاري الرفع...' : 'رفع صورة من جهازك'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingCover}
                          onChange={handleCoverUpload}
                        />
                      </label>
                      <span className="text-[11px] text-muted-foreground">أو أدخل الرابط مباشرة:</span>
                    </div>

                    <input
                      type="url"
                      placeholder="https://..."
                      value={form.coverImage}
                      onChange={(e) => setForm(prev => ({ ...prev, coverImage: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Row 9: Additional Gallery Images */}
              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <label className="block text-xs font-bold text-foreground mb-2">
                  معرض الصور الإضافية (Gallery):
                </label>

                {form.gallery.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
                    {form.gallery.map((imgUrl, gIdx) => (
                      <div key={gIdx} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted group">
                        <img src={imgUrl} alt={`صورة ${gIdx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(gIdx)}
                          className="absolute top-1 left-1 rounded-full bg-black/70 p-1 text-white hover:bg-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors">
                    {uploadingGallery ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span>رفع صور إضافية للمعرض</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploadingGallery}
                      onChange={handleGalleryUpload}
                    />
                  </label>

                  <div className="flex items-center gap-2 flex-1 w-full">
                    <input
                      type="url"
                      placeholder="أو أدخل رابط صورة للمعرض..."
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGalleryUrl(); } }}
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      className="rounded-xl bg-primary/10 text-primary px-3 py-2 text-xs font-bold hover:bg-primary/20"
                    >
                      + إضافة
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 10: Featured Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={form.featured}
                  onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="featured-check" className="text-xs font-bold text-foreground cursor-pointer">
                  تمييز هذا المشروع (عرض شارة "مشروع مميز" وإبرازه في الصفحة الرئيسية)
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-border/70 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border bg-muted/40 px-5 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{editingId ? 'حفظ التعديلات' : 'إضافة المشروع'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-destructive/20 bg-card p-6 text-foreground shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center gap-3 mb-4 text-destructive">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">تأكيد حذف المشروع</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              هل أنت متأكد من رغبتك في حذف هذا المشروع نهائياً؟ لن يظهر المشروع بعد الحذف في صفحة المشاريع العامة بالموقع.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-destructive px-5 py-2 text-xs font-bold text-white hover:bg-destructive/90 shadow-md"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
