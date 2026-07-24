import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type SiteSettings = Record<string, string>;

export const useSiteSettings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['site_settings'],
    queryFn: async () => {
      const { data } = await supabase.from('site_settings').select('key, value');
      const map: SiteSettings = {};
      (data || []).forEach((r: any) => { map[r.key] = r.value ?? ''; });
      return map;
    },
    staleTime: 60_000,
  });

  const s = (key: string, fallback = '') => (data?.[key] ?? fallback);
  return { settings: data || {}, s, isLoading };
};
