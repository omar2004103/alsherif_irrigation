import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBlogPosts } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

const AdminBlog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = useBlogPosts();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', slug: '', content: '', excerpt: '', image_url: '', published: false, author_name: 'فريق الشريف' });

  const resetForm = () => { setForm({ title: '', slug: '', content: '', excerpt: '', image_url: '', published: false, author_name: 'فريق الشريف' }); setEditingId(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.title || !form.content) { toast({ title: 'خطأ', description: 'يرجى ملء العنوان والمحتوى', variant: 'destructive' }); return; }
    const slug = form.slug || form.title.replace(/\s+/g, '-');
    if (editingId) {
      await supabase.from('blog_posts').update({ ...form, slug }).eq('id', editingId);
      toast({ title: 'تم التحديث' });
    } else {
      await supabase.from('blog_posts').insert({ ...form, slug });
      toast({ title: 'تمت الإضافة' });
    }
    queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('blog_posts').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
    toast({ title: 'تم الحذف' });
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    await supabase.from('blog_posts').update({ published: !published }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">إدارة المدونة</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-button hover:scale-105 transition-transform">
          <Plus className="h-4 w-4" />مقال جديد
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold text-foreground">{editingId ? 'تعديل المقال' : 'مقال جديد'}</h2>
          <div className="grid gap-4">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="عنوان المقال *"
              className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="ملخص قصير"
              className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="محتوى المقال *" rows={8}
              className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="رابط الصورة (اختياري)" dir="ltr"
              className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} id="published" className="h-4 w-4" />
              <label htmlFor="published" className="text-sm font-medium text-foreground">نشر المقال</label>
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
          {posts?.map(post => (
            <div key={post.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card">
              <div>
                <h3 className="font-bold text-foreground">{post.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{post.excerpt}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${post.published ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {post.published ? 'منشور' : 'مسودة'}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleTogglePublish(post.id, post.published)} className="rounded-lg p-2 text-foreground hover:bg-accent">
                  {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => { setEditingId(post.id); setForm({ title: post.title, slug: post.slug, content: post.content, excerpt: post.excerpt, image_url: post.image_url || '', published: post.published, author_name: post.author_name }); setShowForm(true); }}
                  className="rounded-lg p-2 text-foreground hover:bg-accent"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(post.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
