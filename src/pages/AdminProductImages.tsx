import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Link2, Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts, useCategories } from '@/hooks/useSupabaseData';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const AdminProductImages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const { data: allImages } = useQuery({
    queryKey: ['all_product_images'],
    queryFn: async () => {
      const { data } = await supabase.from('product_images').select('*').order('order');
      return data || [];
    },
  });

  const filtered = products?.filter(p => p.title.includes(search)) || [];

  const handleUpload = async (productId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const ext = file.name.split('.').pop();
      const path = `${productId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (error) { toast({ title: 'خطأ', description: error.message, variant: 'destructive' }); return; }
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
      await supabase.from('products').update({ image_url: urlData.publicUrl }).eq('id', productId);
      await supabase.from('product_images').insert({ product_id: productId, image_url: urlData.publicUrl });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['all_product_images'] });
      toast({ title: 'تم الرفع' });
    };
    input.click();
  };

  const handleAddExtraImage = async (productId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('product-images').upload(path, file);
        if (error) continue;
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        await supabase.from('product_images').insert({ product_id: productId, image_url: urlData.publicUrl });
      }
      queryClient.invalidateQueries({ queryKey: ['all_product_images'] });
      toast({ title: 'تم رفع الصور' });
    };
    input.click();
  };

  const handleSetUrl = async (productId: string) => {
    if (!imageUrl.trim()) return;
    await supabase.from('products').update({ image_url: imageUrl }).eq('id', productId);
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setEditingId(null);
    setImageUrl('');
    toast({ title: 'تم التحديث' });
  };

  const handleDeleteImage = async (productId: string) => {
    await supabase.from('products').update({ image_url: null }).eq('id', productId);
    queryClient.invalidateQueries({ queryKey: ['products'] });
    toast({ title: 'تم حذف الصورة الرئيسية' });
  };

  const handleDeleteExtraImage = async (imageId: string) => {
    await supabase.from('product_images').delete().eq('id', imageId);
    queryClient.invalidateQueries({ queryKey: ['all_product_images'] });
    toast({ title: 'تم حذف الصورة' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">صور المنتجات</h1>
        <span className="text-sm text-muted-foreground">إدارة: 01028200048</span>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input placeholder="ابحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-input bg-card py-3 pr-10 pl-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(product => {
          const cat = categories?.find(c => c.id === product.category_id);
          const extraImages = allImages?.filter(img => img.product_id === product.id) || [];
          return (
            <div key={product.id} className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
              <div className="relative h-48 bg-muted/50 flex items-center justify-center">
                {product.image_url ? <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" /> :
                  <p className="text-sm text-muted-foreground">لا توجد صورة</p>}
              </div>

              {extraImages.length > 0 && (
                <div className="flex gap-1 p-2 overflow-x-auto">
                  {extraImages.map(img => (
                    <div key={img.id} className="relative flex-shrink-0">
                      <img src={img.image_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      <button onClick={() => handleDeleteExtraImage(img.id)}
                        className="absolute -top-1 -right-1 rounded-full bg-destructive p-0.5 text-destructive-foreground">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-foreground">{product.title}</h3>
                  {cat && <p className="text-xs text-muted-foreground">{cat.name}</p>}
                </div>

                {editingId === product.id && (
                  <div className="flex gap-2">
                    <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="رابط الصورة..." dir="ltr"
                      className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    <button onClick={() => handleSetUrl(product.id)} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">حفظ</button>
                    <button onClick={() => { setEditingId(null); setImageUrl(''); }} className="rounded-lg border border-border px-3 py-2 text-xs text-foreground">إلغاء</button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleUpload(product.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:scale-105 transition-transform">
                    <Upload className="h-3.5 w-3.5" />رفع صورة رئيسية
                  </button>
                  <button onClick={() => handleAddExtraImage(product.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground hover:scale-105 transition-transform">
                    <Plus className="h-3.5 w-3.5" />صور إضافية
                  </button>
                  <button onClick={() => { setEditingId(product.id); setImageUrl(product.image_url || ''); }}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors">
                    <Link2 className="h-3.5 w-3.5" />رابط صورة
                  </button>
                  {product.image_url && (
                    <button onClick={() => handleDeleteImage(product.id)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />حذف
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminProductImages;
