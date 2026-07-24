import { useState, useEffect } from 'react';
import { Menu, X, Phone, MessageCircle, FileText, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import logoAsset from '@/assets/al-sherif-logo.png.asset.json';
import { useQuoteCart } from '@/hooks/useQuoteCart';
import { useSiteSettings } from '@/hooks/useSiteSettings';


const navLinks = [
  { label: '🏠 الرئيسية', href: '/', isRoute: true },
  { label: '📦 المنتجات', href: '/products', isRoute: true },
  { label: '🛠️ الخدمات', href: '/services', isRoute: true },
  { label: '🚜 المشاريع', href: '/#projects', isRoute: false },
  { label: '📰 المقالات', href: '/blog', isRoute: true },
  { label: '🏢 من نحن', href: '/about', isRoute: true },
  { label: '📞 تواصل معنا', href: '/contact', isRoute: true },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useQuoteCart();
  const { pathname } = useLocation();
  const { s } = useSiteSettings();
  const logoUrl = s('logo_url') || logoAsset.url || '/logo.png';
  const phone1 = s('phone1', '01111661177');
  const phone2 = s('phone2', '01122811500');
  const whatsapp = s('whatsapp', '201028200048');
  const hours = s('hours', 'السبت - الخميس · 9ص - 6م');
  const nameAr = s('company_name_ar', 'آل شريف لنظم الري الحديث');


  // Non-home routes always render "solid" navbar (no dark hero behind)
  const forceSolid = pathname !== '/';
  const solid = scrolled || forceSolid;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${solid ? 'bg-card/95 backdrop-blur-xl shadow-card border-b border-border' : 'bg-transparent'}`}>
      <div className={`transition-colors duration-500 ${solid ? 'border-b border-border/50 bg-accent/40' : 'border-b border-primary-foreground/10 bg-transparent'}`}>
        <div className="container flex items-center justify-between py-2 text-xs">
          <div className="flex items-center gap-5">
            <a href={`tel:${phone1}`} className={`flex items-center gap-1.5 transition-colors ${solid ? 'text-muted-foreground hover:text-primary' : 'text-primary-foreground/70 hover:text-primary-foreground'}`}>
              <Phone className="h-3 w-3" /><span dir="ltr">{phone1}</span>
            </a>
            <a href={`tel:${phone2}`} className={`hidden sm:flex items-center gap-1.5 transition-colors ${solid ? 'text-muted-foreground hover:text-primary' : 'text-primary-foreground/70 hover:text-primary-foreground'}`}>
              <Phone className="h-3 w-3" /><span dir="ltr">{phone2}</span>
            </a>
          </div>
          <span className={`hidden sm:inline text-[11px] font-medium tracking-wide ${solid ? 'text-muted-foreground' : 'text-primary-foreground/60'}`}>
            {hours}

          </span>
        </div>
      </div>

      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoUrl} alt={nameAr} className="h-11 w-11 object-contain" />
          <div className="hidden sm:block leading-tight">
            <h1 className={`text-[15px] font-extrabold tracking-tight ${solid ? 'text-primary' : 'text-primary-foreground'}`}>آل شريف</h1>
            <p className={`text-[10.5px] font-medium tracking-wide ${solid ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>لنظم الري الحديث</p>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => link.isRoute ? (
            <Link key={link.href} to={link.href} className={`relative rounded-md px-3.5 py-2 text-sm font-semibold transition-colors ${solid ? 'text-foreground/80 hover:text-primary' : 'text-primary-foreground/85 hover:text-primary-foreground'}`}>{link.label}</Link>
          ) : (
            <a key={link.href} href={link.href} className={`relative rounded-md px-3.5 py-2 text-sm font-semibold transition-colors ${solid ? 'text-foreground/80 hover:text-primary' : 'text-primary-foreground/85 hover:text-primary-foreground'}`}>{link.label}</a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/search" aria-label="بحث" className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${solid ? 'text-foreground/70 hover:bg-accent hover:text-primary' : 'text-primary-foreground/80 hover:bg-primary-foreground/10'}`}>
            <Search className="h-4 w-4" />
          </Link>
          <Link
            to="/quote"
            className="relative inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-secondary-foreground shadow-button transition-transform hover:-translate-y-0.5"
          >
            <FileText className="h-4 w-4" />📋 طلب عرض سعر
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[hsl(32,95%,44%)] px-1 text-[10px] font-extrabold text-white shadow-md">
                {count}
              </span>
            )}
          </Link>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('السلام عليكم، أريد الاستفسار عن منتجات ' + nameAr)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-button transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle className="h-4 w-4" /> واتساب
          </a>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className={`lg:hidden relative rounded-md p-2 transition-colors ${solid ? 'text-foreground hover:bg-accent' : 'text-primary-foreground hover:bg-primary-foreground/10'}`} aria-label="القائمة">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          {count > 0 && !isOpen && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[hsl(32,95%,44%)] px-1 text-[9px] font-extrabold text-white">{count}</span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-card/98 backdrop-blur-md">
            <div className="container py-4 space-y-1">
              {navLinks.map(link => link.isRoute ? (
                <Link key={link.href} to={link.href} onClick={() => setIsOpen(false)} className="block rounded-md px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent hover:text-primary">{link.label}</Link>
              ) : (
                <a key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="block rounded-md px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent hover:text-primary">{link.label}</a>
              ))}
              <Link to="/quote" onClick={() => setIsOpen(false)} className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-secondary py-3 text-sm font-bold text-secondary-foreground">
                <FileText className="h-4 w-4" />طلب عرض سعر {count > 0 && <span className="rounded-full bg-white/25 px-2 text-xs">{count}</span>}
              </Link>
              <div className="flex gap-2 pt-2">
                <a href={`tel:${phone1}`} className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-bold text-foreground">
                  <Phone className="h-4 w-4" />اتصل
                </a>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground">

                  <MessageCircle className="h-4 w-4" />واتساب
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
