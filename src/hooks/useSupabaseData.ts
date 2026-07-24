import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCategories = () => useQuery({
  queryKey: ['categories'],
  queryFn: async () => {
    const { data, error } = await supabase.from('categories').select('*').order('order');
    if (error) throw error;
    return data;
  },
});

export const useProducts = () => useQuery({
  queryKey: ['products'],
  queryFn: async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const useProductBySlug = (slug: string | undefined) => useQuery({
  queryKey: ['product', slug],
  queryFn: async () => {
    if (!slug) return null;
    const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    return data;
  },
  enabled: !!slug,
});

export const useProductsByIds = (ids: string[]) => useQuery({
  queryKey: ['products', 'ids', ...ids],
  queryFn: async () => {
    if (!ids.length) return [];
    const { data, error } = await supabase.from('products').select('*').in('id', ids);
    if (error) throw error;
    // Preserve requested order
    return ids.map((id) => data?.find((d) => d.id === id)).filter(Boolean) as any[];
  },
  enabled: ids.length > 0,
});

export const useProductsByCategory = (categoryId: string | null) => useQuery({
  queryKey: ['products', 'category', categoryId],
  queryFn: async () => {
    let query = supabase.from('products').select('*');
    if (categoryId) query = query.eq('category_id', categoryId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const useProductImages = (productId: string) => useQuery({
  queryKey: ['product_images', productId],
  queryFn: async () => {
    const { data, error } = await supabase.from('product_images').select('*').eq('product_id', productId).order('order');
    if (error) throw error;
    return data;
  },
  enabled: !!productId,
});

export const useFaqItems = () => useQuery({
  queryKey: ['faq_items'],
  queryFn: async () => {
    const { data, error } = await supabase.from('faq_items').select('*').order('order');
    if (error) throw error;
    return data;
  },
});

export const useTestimonials = () => useQuery({
  queryKey: ['testimonials'],
  queryFn: async () => {
    const { data, error } = await supabase.from('testimonials').select('*');
    if (error) throw error;
    return data;
  },
});

export const useBlogPosts = () => useQuery({
  queryKey: ['blog_posts'],
  queryFn: async () => {
    const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const useTips = () => useQuery({
  queryKey: ['tips'],
  queryFn: async () => {
    const { data, error } = await supabase.from('tips').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const useInquiries = () => useQuery({
  queryKey: ['inquiries'],
  queryFn: async () => {
    const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const useBrands = () => useQuery({
  queryKey: ['brands'],
  queryFn: async () => {
    const { data, error } = await supabase.from('brands').select('*').order('order');
    if (error) throw error;
    return data;
  },
});

export const useSiteSettings = () => useQuery({
  queryKey: ['site_settings'],
  queryFn: async () => {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) throw error;
    const settings: Record<string, string> = {};
    data?.forEach(s => { settings[s.key] = s.value; });
    return settings;
  },
});

export const getWhatsAppLink = (whatsappNumber: string, productName?: string) => {
  const message = productName
    ? `السلام عليكم، أريد الاستفسار عن منتج: ${productName}`
    : 'السلام عليكم، أريد الاستفسار عن منتجات الري';
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

export const getCallLink = (number: string) => `tel:${number}`;
