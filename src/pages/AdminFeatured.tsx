import { useQueryClient } from '@tanstack/react-query';
import { Star, StarOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

const AdminFeatured = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useProducts();

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('products').update({ featured: !current }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['products'] });
    toast({ title: current ? 'تم إلغاء التمييز' : 'تم التمييز ✨' });
  };

  const featured = products?.filter(p => p.featured) || [];
  const notFeatured = products?.filter(p => !p.featured) || [];

  if (isLoading) return <p className="text-muted-foreground p-6">جاري التحميل...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Star className="h-6 w-6 text-primary" />المنتجات المميزة</h1>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">⭐ المميزة ({featured.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(p => (
            <div key={p.id} className="rounded-2xl border-2 border-primary/30 bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">{p.title}</h3>
                <button onClick={() => toggleFeatured(p.id, true)} className="rounded-lg p-2 text-primary hover:bg-primary/10">
                  <StarOff className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{p.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">باقي المنتجات ({notFeatured.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notFeatured.map(p => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">{p.title}</h3>
                <button onClick={() => toggleFeatured(p.id, false)} className="rounded-lg p-2 text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <Star className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminFeatured;
