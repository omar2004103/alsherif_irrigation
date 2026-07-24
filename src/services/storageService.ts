import { supabase } from '@/integrations/supabase/client';

export const BUCKET_NAME = 'product-images';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * Fallbacks to Base64 Data URL if Storage bucket or RLS restricts upload.
 */
export async function uploadFileToSupabase(file: File, folder = 'products'): Promise<{ url: string; path: string }> {
  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    // Attempt Supabase Storage upload first
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (!error && data?.path) {
      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
      return {
        url: publicUrlData.publicUrl,
        path: data.path,
      };
    }

    // Fallback to 'media' bucket if 'product-images' is not configured
    const { data: mediaData, error: mediaError } = await supabase.storage.from('media').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (!mediaError && mediaData?.path) {
      const { data: mediaPublicUrlData } = supabase.storage.from('media').getPublicUrl(mediaData.path);
      return {
        url: mediaPublicUrlData.publicUrl,
        path: mediaData.path,
      };
    }

    // Base64 Data URL fallback for offline / restricted environments
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve({ url: reader.result, path: fileName });
        } else {
          reject(new Error('Failed to convert file to data URL'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsDataURL(file);
    });
  } catch (err: any) {
    console.warn('Storage upload fallback triggered:', err?.message || err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve({ url: reader.result, path: `local/${file.name}` });
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsDataURL(file);
    });
  }
}
