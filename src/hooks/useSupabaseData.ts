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

export const useProductBySlug = (slugOrId: string | undefined) => useQuery({
  queryKey: ['product', slugOrId],
  queryFn: async () => {
    if (!slugOrId) return null;
    let decoded = slugOrId.trim();
    try {
      decoded = decodeURIComponent(slugOrId).trim();
    } catch {
      decoded = slugOrId.trim();
    }

    // 1. Try slug match with decoded value
    const { data: bySlug, error: slugError } = await supabase
      .from('products')
      .select('*')
      .eq('slug', decoded)
      .maybeSingle();

    if (bySlug) return bySlug;

    // 2. If decoded is different from raw parameter, try raw value
    if (decoded !== slugOrId) {
      const { data: byRawSlug } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slugOrId)
        .maybeSingle();

      if (byRawSlug) return byRawSlug;
    }

    // 3. Fallback: Check if parameter is a valid UUID, search by id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(decoded);
    if (isUuid) {
      const { data: byId } = await supabase
        .from('products')
        .select('*')
        .eq('id', decoded)
        .maybeSingle();

      if (byId) return byId;
    }

    // 4. Fallback: Lookup by product_code (SKU)
    const { data: byCode } = await supabase
      .from('products')
      .select('*')
      .eq('product_code', decoded)
      .maybeSingle();

    if (byCode) return byCode;

    if (slugError) {
      console.warn('Product lookup warning:', slugError);
    }
    return null;
  },
  enabled: !!slugOrId,
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
