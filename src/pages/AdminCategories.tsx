import { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', order: 0 });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').order('order');
      return data || [];
    }
  });

  const handleSave = async () => {
    if (!form.name) { toast({ title: 'خطأ', description: 'يرجى إدخال اسم القسم', variant: 'destructive' }); return; }
    const slug = form.slug || form.name.replace(/\s+/g, '-');
    if (editing) {
      await supabase.from('categories').update({ name: form.name, slug, order: form.order }).eq('id', editing.id);
      toast({ title: 'تم التحديث' });
    } else {
      await supabase.from('categories').insert({ name: form.name, slug, order: form.order });
      toast({ title: 'تمت الإضافة' });
    }
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    toast({ title: 'تم الحذف' });
  };

  const handleEdit = (cat: any) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, order: cat.order });
    setShowForm(true);
  };

  const resetForm = () => { setForm({ name: '', slug: '', order: 0 }); setEditing(null); setShowForm(false); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FolderOpen className="h-6 w-6 text-primary" />إدارة الأقسام</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-button hover:scale-105 transition-transform">
          <Plus className="h-4 w-4" />إضافة قسم
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold text-foreground">{editing ? 'تعديل القسم' : 'إضافة قسم جديد'}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">اسم القسم *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">الرابط (slug)</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} dir="ltr"
                className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">الترتيب</label>
              <input type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-button">{editing ? 'تحديث' : 'إضافة'}</button>
            <button onClick={resetForm} className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-accent">إلغاء</button>
          </div>
        </div>
      )}

      {isLoading ? <p className="text-muted-foreground">جاري التحميل...</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories?.map(cat => (
            <div key={cat.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">الترتيب: {cat.order}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(cat)} className="rounded-lg p-2 text-foreground hover:bg-accent"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
