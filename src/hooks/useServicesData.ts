import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SERVICES_DATA, ServiceItem } from '@/data/servicesData';

const STORAGE_KEY = 'alsherif_services_cache';
const SETTING_KEY = 'services_list';

// Helper to merge stored services with canonical SERVICES_DATA to preserve order and content
function mergeWithCanonical(storedList: Partial<ServiceItem>[]): ServiceItem[] {
  const storedMap = new Map<string, Partial<ServiceItem>>();
  storedList.forEach(s => {
    if (s.id) storedMap.set(s.id, s);
    else if (s.title) storedMap.set(s.title, s);
  });

  return SERVICES_DATA.map(canonical => {
    const matched = storedMap.get(canonical.id) || storedMap.get(canonical.title);
    const mainImg = matched?.image_url && matched.image_url.trim() ? matched.image_url.trim() : null;
    const rawGallery = Array.isArray(matched?.gallery_images)
      ? matched.gallery_images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
      : [];

    // Enforce 10 images total maximum (1 main + up to 9 gallery)
    const maxAdditional = mainImg ? 9 : 10;
    const galleryImg = rawGallery.slice(0, maxAdditional);

    return {
      ...canonical,
      desc: matched?.desc && matched.desc.trim() ? matched.desc.trim() : canonical.desc,
      detailed_description: matched?.detailed_description && matched.detailed_description.trim()
        ? matched.detailed_description.trim()
        : canonical.detailed_description,
      image_url: mainImg,
      gallery_images: galleryImg,
    };
  });
}

function getLocalServicesCache(): ServiceItem[] {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return mergeWithCanonical(parsed);
      }
    }
  } catch (e) {
    console.error('Error reading services cache:', e);
  }
  return SERVICES_DATA;
}

function setLocalServicesCache(services: ServiceItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  } catch (e) {
    console.error('Error saving services cache:', e);
  }
}

export function useServicesData() {
  const queryClient = useQueryClient();

  const { data: services = getLocalServicesCache(), isLoading } = useQuery<ServiceItem[]>({
    queryKey: ['services_data'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', SETTING_KEY)
          .maybeSingle();

        if (error) {
          console.warn('Could not fetch services_list from site_settings:', error.message);
          return getLocalServicesCache();
        }

        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const merged = mergeWithCanonical(parsed);
              setLocalServicesCache(merged);
              return merged;
            }
          } catch (pe) {
            console.error('Error parsing services_list JSON:', pe);
          }
        }

        return getLocalServicesCache();
      } catch (err) {
        console.error('Unexpected error in useServicesData query:', err);
        return getLocalServicesCache();
      }
    },
    staleTime: 30_000,
    initialData: getLocalServicesCache,
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedServices: ServiceItem[]) => {
      // 1. Sanitize & enforce 10 images limit before saving
      const sanitized = updatedServices.map(s => {
        const main = s.image_url && s.image_url.trim() ? s.image_url.trim() : null;
        const maxGal = main ? 9 : 10;
        const gal = (s.gallery_images || []).filter(img => typeof img === 'string' && img.trim().length > 0).slice(0, maxGal);
        return {
          ...s,
          image_url: main,
          gallery_images: gal,
          detailed_description: s.detailed_description && s.detailed_description.trim() ? s.detailed_description.trim() : null,
        };
      });

      // 2. Update local cache immediately
      setLocalServicesCache(sanitized);

      // 3. Persist to Supabase site_settings
      const { error } = await supabase.from('site_settings').upsert(
        {
          key: SETTING_KEY,
          value: JSON.stringify(sanitized),
        },
        { onConflict: 'key' }
      );

      if (error) {
        console.error('Failed to persist services to site_settings:', error);
        throw error;
      }

      return sanitized;
    },
    onSuccess: (sanitized) => {
      queryClient.setQueryData(['services_data'], sanitized);
      queryClient.invalidateQueries({ queryKey: ['services_data'] });
      queryClient.invalidateQueries({ queryKey: ['site_settings'] });
    },
  });

  const updateService = async (id: string, partial: Partial<ServiceItem>) => {
    const updated = services.map(s => (s.id === id ? { ...s, ...partial } : s));
    await saveMutation.mutateAsync(updated);
  };

  return {
    services,
    isLoading,
    saveServices: saveMutation.mutateAsync,
    updateService,
    isSaving: saveMutation.isPending,
  };
}
