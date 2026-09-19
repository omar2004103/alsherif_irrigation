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

      // Ensure official Google Maps location is always up-to-date
      const currentEmbed = map['google_map_embed'];
      if (!currentEmbed || currentEmbed.includes('P726%2BRV2') || currentEmbed.includes('P726+RV2')) {
        map['google_map_embed'] = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3434.331!2d30.2617714!3d30.7021432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458a9196d930b5b%3A0xeee0d144d3ad9d13!2z2LTYsdmD2Kkg2KfZhCDYtNix2YrZgSDZhNmE2LHZiiDYp9mE2K3Yr9mK2Kw!5e0!3m2!1sar!2seg!4v1726788800000!5m2!1sar!2seg';
      }
      const currentLink = map['google_map_link'];
      if (!currentLink || currentLink === '#' || currentLink.includes('P726')) {
        map['google_map_link'] = 'https://maps.app.goo.gl/MJSzM41LFD4UCEhf8';
      }

      return map;
    },
    staleTime: 60_000,
  });

  const s = (key: string, fallback = '') => (data?.[key] ?? fallback);
  return { settings: data || {}, s, isLoading };
};
