import { useEffect, useState, useCallback } from 'react';

export type QuoteItem = {
  id: string;
  title: string;
  slug: string;
  image?: string | null;
  brand?: string | null;
  product_code?: string | null;
  quantity: number;
  addedAt: number;
};

const KEY = 'alsherif_quote_cart_v1';
const EVT = 'alsherif:quote-cart-changed';

function read(): QuoteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QuoteItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: QuoteItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useQuoteCart() {
  const [items, setItems] = useState<QuoteItem[]>(() => read());

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const add = useCallback((item: Omit<QuoteItem, 'quantity' | 'addedAt'>, qty = 1) => {
    const current = read();
    const idx = current.findIndex((c) => c.id === item.id);
    if (idx >= 0) current[idx].quantity += qty;
    else current.push({ ...item, quantity: qty, addedAt: Date.now() });
    write(current);
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((c) => c.id !== id));
  }, []);

  const setQuantity = useCallback((id: string, qty: number) => {
    const current = read();
    const idx = current.findIndex((c) => c.id === id);
    if (idx >= 0) {
      current[idx].quantity = Math.max(1, qty);
      write(current);
    }
  }, []);

  const clear = useCallback(() => write([]), []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const distinctCount = items.length;

  return { items, count, distinctCount, add, remove, setQuantity, clear };
}