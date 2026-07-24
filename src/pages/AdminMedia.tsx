import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Image as ImageIcon, Upload, Trash2, Copy, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type Obj = { name: string; url: string };

const AdminMedia = () => {
  const [items, setItems] = useState<Obj[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from('product-images').list('site', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) { toast({ title: 'خطأ', description: error.message, variant: 'destructive' }); setLoading(false); return; }
    const rows = (data || []).filter(f => f.name && !f.name.endsWith('/')).map(f => {
      const path = `site/${f.name}`;
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
      return { name: path, url: pub.publicUrl };
    });
    setItems(rows);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `site/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from('product-images').upload(path, file);
        if (error) throw error;
      }
      toast({ title: 'تم الرفع ✅' });
      load();
    } catch (e: any) {
      toast({ title: 'خطأ في الرفع', description: e.message, variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const handleDelete = async (path: string) => {
    if (!confirm('حذف هذا الملف نهائياً؟')) return;
    const { error } = await supabase.storage.from('product-images').remove([path]);
    if (error) { toast({ title: 'خطأ', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'تم الحذف' });
    load();
  };

  const copyUrl = (url: string) => { navigator.clipboard.writeText(url); toast({ title: 'تم نسخ الرابط' }); };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ImageIcon className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">مكتبة الوسائط</h1>
            <p className="text-sm text-muted-foreground">ارفع وأدر صور وملفات الموقع.</p>
          </div>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-button hover:opacity-90">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          رفع ملفات
          <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files)} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">جاري التحميل...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">لا توجد ملفات بعد. اضغط "رفع ملفات" للبدء.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map(it => (
            <div key={it.name} className="group relative overflow-hidden rounded-xl border border-border bg-card">
              <img src={it.url} alt="" className="aspect-square w-full object-cover" />
              <div className="absolute inset-0 flex items-end gap-2 bg-gradient-to-t from-foreground/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => copyUrl(it.url)} className="rounded-lg bg-background/90 p-2 text-foreground hover:bg-background" title="نسخ الرابط"><Copy className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(it.name)} className="rounded-lg bg-destructive/90 p-2 text-destructive-foreground hover:bg-destructive" title="حذف"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
