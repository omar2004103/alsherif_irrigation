import { Phone, MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const DEFAULT_MSG = 'السلام عليكم، أريد الاستفسار عن منتجات شركة آل شريف لنظم الري الحديث.';

const FloatingActions = () => {
  const { pathname } = useLocation();
  const [productName, setProductName] = useState<string | null>(null);

  useEffect(() => {
    if (!pathname.startsWith('/product/')) { setProductName(null); return; }
    // Wait a tick for Helmet to set the title
    const t = setTimeout(() => {
      const raw = document.title || '';
      const name = raw.split('—')[0].split('|')[0].trim();
      setProductName(name || null);
    }, 400);
    return () => clearTimeout(t);
  }, [pathname]);

  const message = productName
    ? `السلام عليكم، أريد الاستفسار عن المنتج: ${productName} من شركة آل شريف لنظم الري الحديث.`
    : DEFAULT_MSG;
  const waHref = `https://wa.me/201111661177?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 print:hidden">
      <a href="tel:01111661177" className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-button transition-transform hover:scale-110" aria-label="اتصل بنا">
        <Phone className="h-6 w-6" />
      </a>
      <a href={waHref} target="_blank" rel="noopener noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-button animate-pulse_glow transition-transform hover:scale-110" aria-label="تواصل واتساب">
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
};

export default FloatingActions;
