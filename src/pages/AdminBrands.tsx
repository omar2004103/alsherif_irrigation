import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, X, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBrands } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

const emptyForm = { name: '', slug: '', logo_url: '', description: '', website: '', order: 0 };

const AdminBrands = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: brands, isLoading } = useBrands();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = brands?.filter(b => b.name.includes(search) || (b.slug || '').includes(search)) || [];

  const reset = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

  const openEdit = (b: any) => {
    setEditing(b);
    setForm({ name: b.name, slug: b.slug, logo_url: b.logo_url || '', description: b.description || '', website: b.website || '', order: b.order || 0 });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: 'الاسم مطلوب', variant: 'destructive' }); return; }
    const slug = (form.slug || form.name).trim().replace(/\s+/g, '-').toLowerCase();
    const payload = { name: form.name.trim(), slug, logo_url: form.logo_url || null, description: form.description || null, website: form.website || null, order: Number(form.order) || 0 };
    const { error } = editing
      ? await supabase.from('brands').update(payload).eq('id', editing.id)
      : await supabase.from('brands').insert(payload);
    if (error) { toast({ title: 'خطأ', description: error.message, variant: 'destructive' }); return; }
    toast({ title: editing ? 'تم التحديث' : 'تمت الإضافة' });
    qc.invalidateQueries({ queryKey: ['brands'] });
    reset();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذه العلامة التجارية؟')) return;
    await supabase.from('brands').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['brands'] });
    toast({ title: 'تم الحذف' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">إدارة العلامات التجارية</h1>
        <button onClick={() => { reset(); setShowForm(true); }} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-button hover:scale-105 transition-transform">
          <Plus className="h-4 w-4" />إضافة علامة تجارية
        </button>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input placeholder="ابحث بالاسم..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-input bg-card py-3 pr-10 pl-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {isLoading ? <p className="text-muted-foreground">جاري التحميل...</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(b => (
            <div key={b.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="mb-3 flex h-24 items-center justify-center rounded-xl bg-muted/40 overflow-hidden">
                {b.logo_url ? <img src={b.logo_url} alt={b.name} className="max-h-full max-w-full object-contain p-2" />
                  : <Building2 className="h-10 w-10 text-muted-foreground/40" />}
              </div>
              <h3 className="font-bold text-foreground">{b.name}</h3>
              {b.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{b.description}</p>}
              <div className="mt-3 flex gap-2">
                <button onClick={() => openEdit(b)} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Edit className="h-3.5 w-3.5" />تعديل
                </button>
                <button onClick={() => handleDelete(b.id)} className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="col-span-full text-center py-8 text-muted-foreground">لا توجد علامات تجارية</p>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={reset}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-hero" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{editing ? 'تعديل' : 'إضافة'} علامة تجارية</h2>
              <button onClick={reset}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-foreground">الاسم *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm" /></div>
              <div><label className="text-xs font-medium text-foreground">Slug (اختياري)</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm" dir="ltr" /></div>
              <div><label className="text-xs font-medium text-foreground">رابط الشعار (URL)</label>
                <input value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm" dir="ltr" placeholder="https://..." /></div>
              <div><label className="text-xs font-medium text-foreground">الموقع الإلكتروني</label>
                <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm" dir="ltr" /></div>
              <div><label className="text-xs font-medium text-foreground">الوصف</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm resize-none" /></div>
              <div><label className="text-xs font-medium text-foreground">الترتيب</label>
                <input type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm" /></div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={handleSave} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground">حفظ</button>
              <button onClick={reset} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-foreground">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrands;