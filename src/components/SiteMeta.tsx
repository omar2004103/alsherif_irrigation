import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

/**
 * Reads site_settings and reflects title / description / favicon into <head>.
 * Kept lightweight to avoid extra deps.
 */
const SiteMeta = () => {
  const { s, isLoading } = useSiteSettings();

  useEffect(() => {
    if (isLoading) return;
    const title = s('seo_title') || s('company_name_ar') || document.title;
    const desc = s('seo_description');
    const favicon = s('favicon_url');

    if (title) document.title = title;

    if (desc) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = desc;
    }

    if (favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = favicon;
    }
  }, [s, isLoading]);

  return null;
};

export default SiteMeta;
