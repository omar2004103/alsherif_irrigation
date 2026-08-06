import { supabase } from '@/integrations/supabase/client';

export const BUCKET_NAME = 'product-images';

/**
 * Optimizes an image file using HTML Canvas to ensure maximum clarity and sharpness
 * without huge file sizes. Preserves PNG transparency if present.
 */
async function compressImageForHighQuality(file: File, maxDim = 1920, quality = 0.92): Promise<Blob> {
  // If not image, return original
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // Smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const isPng = file.type === 'image/png';
      const outputType = isPng ? 'image/png' : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        outputType,
        quality
      );
    };

    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * Fallbacks to Base64 Data URL if Storage bucket or RLS restricts upload.
 */
export async function uploadFileToSupabase(file: File, folder = 'products'): Promise<{ url: string; path: string }> {
  try {
    const optimizedBlob = await compressImageForHighQuality(file);
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    // Attempt Supabase Storage upload first to 'product-images'
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, optimizedBlob, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

    if (!error && data?.path) {
      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
      return {
        url: publicUrlData.publicUrl,
        path: data.path,
      };
    }

    // Fallback to 'media' bucket
    const { data: mediaData, error: mediaError } = await supabase.storage.from('media').upload(fileName, optimizedBlob, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
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
