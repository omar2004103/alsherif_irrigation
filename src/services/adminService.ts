import { supabase } from '@/integrations/supabase/client';

// Helper function to log admin activity
export async function logActivity(action: string, entity: string, entityId?: string, details?: any) {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id || null;

    await supabase.from('activity_logs').insert({
      userId: userId,
      action: action,
      entity: entity,
      entityId: entityId || null,
      details: details || null,
    });
  } catch (err) {
    console.error('Failed to write activity log:', err);
  }
}

// ------------------------------------------------------
// PRODUCTS & CATALOG SERVICES
// ------------------------------------------------------

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      variants:product_variants(*, brand:brands(*)),
      images:product_images(*),
      specifications:product_specifications(*)
    `)
    .is('deletedAt', null)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      variants:product_variants(*, brand:brands(*)),
      images:product_images(*),
      specifications:product_specifications(*)
    `)
    .eq('slug', slug)
    .is('deletedAt', null)
    .single();

  if (error) throw error;
  return data;
}

// ------------------------------------------------------
// PRODUCT VARIANTS SERVICES
// ------------------------------------------------------

export async function fetchProductVariants(productId: string) {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*, brand:brands(*)')
    .eq('productId', productId)
    .order('order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createProductVariant(variantData: any) {
  const { data, error } = await supabase
    .from('product_variants')
    .insert([variantData])
    .select()
    .single();

  if (error) throw error;

  await logActivity('CREATE_VARIANT', 'PRODUCT_VARIANT', data.id, { productId: data.productId, sku: data.sku });
  return data;
}

export async function updateProductVariant(id: string, variantData: any) {
  const { data, error } = await supabase
    .from('product_variants')
    .update({ ...variantData, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity('UPDATE_VARIANT', 'PRODUCT_VARIANT', id, { sku: data.sku });
  return data;
}

export async function deleteProductVariant(id: string) {
  const { data, error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity('DELETE_VARIANT', 'PRODUCT_VARIANT', id);
  return data;
}

export async function createProduct(productData: any) {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) throw error;

  await logActivity('CREATE', 'PRODUCT', data.id, { title: data.title, slug: data.slug });
  return data;
}

export async function updateProduct(id: string, productData: any) {
  const { data, error } = await supabase
    .from('products')
    .update({ ...productData, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity('UPDATE', 'PRODUCT', id, { title: data.title });
  return data;
}

export async function deleteProduct(id: string) {
  // Soft delete
  const { data, error } = await supabase
    .from('products')
    .update({ deletedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity('DELETE', 'PRODUCT', id);
  return data;
}

// ------------------------------------------------------
// CATEGORIES SERVICES
// ------------------------------------------------------

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('deletedAt', null)
    .order('order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createCategory(categoryData: any) {
  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select()
    .single();

  if (error) throw error;

  await logActivity('CREATE', 'CATEGORY', data.id, { name: data.name });
  return data;
}

export async function updateCategory(id: string, categoryData: any) {
  const { data, error } = await supabase
    .from('categories')
    .update({ ...categoryData, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity('UPDATE', 'CATEGORY', id, { name: data.name });
  return data;
}

export async function deleteCategory(id: string) {
  const { data, error } = await supabase
    .from('categories')
    .update({ deletedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity('DELETE', 'CATEGORY', id);
  return data;
}

// ------------------------------------------------------
// BRANDS SERVICES
// ------------------------------------------------------

export async function fetchBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .is('deletedAt', null)
    .order('order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createBrand(brandData: any) {
  const { data, error } = await supabase
    .from('brands')
    .insert([brandData])
    .select()
    .single();

  if (error) throw error;

  await logActivity('CREATE', 'BRAND', data.id, { name: data.name });
  return data;
}

export async function updateBrand(id: string, brandData: any) {
  const { data, error } = await supabase
    .from('brands')
    .update({ ...brandData, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity('UPDATE', 'BRAND', id, { name: data.name });
  return data;
}

export async function deleteBrand(id: string) {
  const { data, error } = await supabase
    .from('brands')
    .update({ deletedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity('DELETE', 'BRAND', id);
  return data;
}

// ------------------------------------------------------
// SERVICES & ARTICLES
// ------------------------------------------------------

export async function fetchServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .is('deletedAt', null)
    .order('order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createService(serviceData: any) {
  const { data, error } = await supabase
    .from('services')
    .insert([serviceData])
    .select()
    .single();

  if (error) throw error;

  await logActivity('CREATE', 'SERVICE', data.id, { title: data.title });
  return data;
}

export async function updateService(id: string, serviceData: any) {
  const { data, error } = await supabase
    .from('services')
    .update({ ...serviceData, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity('UPDATE', 'SERVICE', id, { title: data.title });
  return data;
}

export async function deleteService(id: string) {
  const { data, error } = await supabase
    .from('services')
    .update({ deletedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity('DELETE', 'SERVICE', id);
  return data;
}

export async function fetchArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .is('deletedAt', null)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createArticle(articleData: any) {
  const { data, error } = await supabase
    .from('articles')
    .insert([articleData])
    .select()
    .single();

  if (error) throw error;

  await logActivity('CREATE', 'ARTICLE', data.id, { title: data.title });
  return data;
}

export async function updateArticle(id: string, articleData: any) {
  const { data, error } = await supabase
    .from('articles')
    .update({ ...articleData, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity('UPDATE', 'ARTICLE', id, { title: data.title });
  return data;
}

export async function deleteArticle(id: string) {
  const { data, error } = await supabase
    .from('articles')
    .update({ deletedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity('DELETE', 'ARTICLE', id);
  return data;
}

// ------------------------------------------------------
// WEBSITE SETTINGS, HOMEPAGE, SEO & FOOTER
// ------------------------------------------------------

export async function fetchWebsiteSettings() {
  const { data, error } = await supabase.from('website_settings').select('*');
  if (error) throw error;
  return data;
}

export async function updateWebsiteSetting(key: string, value: string, group = 'general') {
  const { data, error } = await supabase
    .from('website_settings')
    .upsert({ key, value, group, updatedAt: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;

  await logActivity('UPDATE', 'WEBSITE_SETTING', key, { key, value });
  return data;
}

// ------------------------------------------------------
// CONTACT MESSAGES & QUOTE REQUESTS
// ------------------------------------------------------

export async function fetchContactMessages() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}

export async function submitContactMessage(messageData: { name: string; email: string; phone: string; subject?: string; message: string }) {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert([messageData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchQuoteRequests() {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*, product:products(*)')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}

export async function submitQuoteRequest(quoteData: { customerName: string; company?: string; email?: string; phone: string; productId?: string; projectDetails?: string }) {
  const { data, error } = await supabase
    .from('quote_requests')
    .insert([quoteData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateInquiryStatus(table: 'contact_messages' | 'quote_requests', id: string, status: string) {
  const { data, error } = await supabase
    .from(table)
    .update({ status, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity('UPDATE_STATUS', table.toUpperCase(), id, { status });
  return data;
}

// ------------------------------------------------------
// ACTIVITY LOGS & NOTIFICATIONS
// ------------------------------------------------------

export async function fetchActivityLogs() {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*, user:admin_users(*)')
    .order('createdAt', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data;
}

export async function fetchNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}
