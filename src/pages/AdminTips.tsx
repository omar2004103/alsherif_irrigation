import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTips } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

const AdminTips = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: tips, isLoading } = useTips();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'عام', published: false });

  const resetForm = () => { setForm({ title: '', content: '', category: 'عام', published: false }); setEditingId(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.title || !form.content) { toast({ title: 'خطأ', description: 'يرجى ملء العنوان والمحتوى', variant: 'destructive' }); return; }
    if (editingId) {
      await supabase.from('tips').update(form).eq('id', editingId);
      toast({ title: 'تم التحديث' });
    } else {
      await supabase.from('tips').insert(form);
      toast({ title: 'تمت الإضافة' });
    }
    queryClient.invalidateQueries({ queryKey: ['tips'] });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('tips').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['tips'] });
    toast({ title: 'تم الحذف' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">إدارة النصائح</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-button hover:scale-105 transition-transform">
          <Plus className="h-4 w-4" />نصيحة جديدة
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold text-foreground">{editingId ? 'تعديل النصيحة' : 'نصيحة جديدة'}</h2>
          <div className="grid gap-4">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="العنوان *"
              className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="التصنيف (مثلاً: فلاتر، نقاطات)"
              className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="المحتوى *" rows={5}
              className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} id="tip-pub" className="h-4 w-4" />
              <label htmlFor="tip-pub" className="text-sm font-medium text-foreground">نشر</label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-button">{editingId ? 'تحديث' : 'إضافة'}</button>
            <button onClick={resetForm} className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-accent">إلغاء</button>
          </div>
        </div>
      )}

      {isLoading ? <p className="text-muted-foreground">جاري التحميل...</p> : (
        <div className="space-y-3">
          {tips?.map(tip => (
            <div key={tip.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card">
              <div>
                <h3 className="font-bold text-foreground">{tip.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{tip.category}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditingId(tip.id); setForm({ title: tip.title, content: tip.content, category: tip.category, published: tip.published }); setShowForm(true); }}
                  className="rounded-lg p-2 text-foreground hover:bg-accent"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(tip.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTips;
