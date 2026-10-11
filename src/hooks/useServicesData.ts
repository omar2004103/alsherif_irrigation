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
    return {
      ...canonical,
      image_url: matched?.image_url ? matched.image_url.trim() : null,
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
      // 1. Update local cache immediately
      setLocalServicesCache(updatedServices);

      // 2. Persist to Supabase site_settings
      const { error } = await supabase.from('site_settings').upsert(
        {
          key: SETTING_KEY,
          value: JSON.stringify(updatedServices),
        },
        { onConflict: 'key' }
      );

      if (error) {
        console.error('Failed to persist services to site_settings:', error);
        throw error;
      }

      return updatedServices;
    },
    onSuccess: (updatedServices) => {
      queryClient.setQueryData(['services_data'], updatedServices);
      queryClient.invalidateQueries({ queryKey: ['services_data'] });
      queryClient.invalidateQueries({ queryKey: ['site_settings'] });
    },
  });

  const updateServiceImage = async (id: string, imageUrl: string | null) => {
    const updated = services.map(s => (s.id === id ? { ...s, image_url: imageUrl ? imageUrl.trim() : null } : s));
    await saveMutation.mutateAsync(updated);
  };

  return {
    services,
    isLoading,
    saveServices: saveMutation.mutateAsync,
    updateServiceImage,
    isSaving: saveMutation.isPending,
  };
}
