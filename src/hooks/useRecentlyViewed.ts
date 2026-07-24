import { useEffect, useState, useCallback } from 'react';

const KEY = 'alsherif_recent_products_v1';
const MAX = 8;

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  });

  const track = useCallback((productId: string) => {
    setIds((prev) => {
      const next = [productId, ...prev.filter((p) => p !== productId)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {}, []);

  return { ids, track };
}