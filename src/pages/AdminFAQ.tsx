import { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminFAQ = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ question: '', answer: '', order: 0 });

  const { data: items, isLoading } = useQuery({
    queryKey: ['faq_items'],
    queryFn: async () => {
      const { data } = await supabase.from('faq_items').select('*').order('order');
      return data || [];
    }
  });

  const handleSave = async () => {
    if (!form.question || !form.answer) { toast({ title: 'خطأ', description: 'يرجى ملء السؤال والإجابة', variant: 'destructive' }); return; }
    if (editing) {
      await supabase.from('faq_items').update({ question: form.question, answer: form.answer, order: form.order }).eq('id', editing.id);
      toast({ title: 'تم التحديث' });
    } else {
      await supabase.from('faq_items').insert({ question: form.question, answer: form.answer, order: form.order });
      toast({ title: 'تمت الإضافة' });
    }
    queryClient.invalidateQueries({ queryKey: ['faq_items'] });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('faq_items').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['faq_items'] });
    toast({ title: 'تم الحذف' });
  };

  const resetForm = () => { setForm({ question: '', answer: '', order: 0 }); setEditing(null); setShowForm(false); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><HelpCircle className="h-6 w-6 text-primary" />إدارة الأسئلة الشائعة</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-button hover:scale-105 transition-transform">
          <Plus className="h-4 w-4" />إضافة سؤال
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold text-foreground">{editing ? 'تعديل السؤال' : 'إضافة سؤال جديد'}</h2>
          <div className="grid gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">السؤال *</label>
              <input value={form.question} onChange={e => setForm({ ...form, question: e.target.value })}
                className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">الإجابة *</label>
              <textarea value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} rows={3}
                className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div className="w-32">
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
        <div className="space-y-3">
          {items?.map(item => (
            <div key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <HelpCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">{item.question}</h3>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditing(item); setForm({ question: item.question, answer: item.answer, order: item.order }); setShowForm(true); }}
                    className="rounded-lg p-2 text-foreground hover:bg-accent"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(item.id)}
                    className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFAQ;
