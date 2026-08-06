import { Phone, MessageCircle, ArrowUp, MapPin, Clock, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoAsset from '@/assets/al-sherif-logo.png.asset.json';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const quickLinks = [
  { label: 'الرئيسية', href: '/' },
  { label: 'من نحن', href: '/about' },
  { label: 'المنتجات', href: '/products' },
  { label: 'خدماتنا', href: '/services' },
  { label: 'المدونة', href: '/blog' },
  { label: 'تواصل معنا', href: '/contact' },
];

const Footer = () => {
  const { s } = useSiteSettings();
  const logoUrl = s('logo_url') || logoAsset.url || '/logo.png';
  const nameAr = s('company_name_ar', 'آل شريف');
  const tagline = s('company_tagline', 'لنظم الري الحديث');
  const about = s('footer_about', 'شركة هندسية متخصصة في تصميم وتوريد وتركيب أنظمة الري الحديث للمزارع والمشاريع الزراعية الكبرى.');
  const phone1 = s('phone1', '01111661177');
  const phone1Label = s('phone1_label', 'م. عادل الشريف — مدير الشركة');
  const phone2 = s('phone2', '01008028048');
  const phone2Label = s('phone2_label', 'م. عادل الشريف — مدير الشركة');
  const whatsapp = s('whatsapp', '201111661177');
  const address = s('address', 'الشعراوي، قطاع غرب النوبارية، مركز حوش عيسى، محافظة البحيرة، مصر');
  const postal = s('postal_code', '5820220');
  const plus = s('plus_code', 'P726+RV2');
  const mapLink = s('google_map_link', '#');
  const hours = s('hours', 'السبت - الخميس · 9ص - 6م');

  const socials = [
    { url: s('social_facebook'), Icon: Facebook, label: 'Facebook' },
    { url: s('social_instagram'), Icon: Instagram, label: 'Instagram' },
    { url: s('social_youtube'), Icon: Youtube, label: 'YouTube' },
    { url: s('social_linkedin'), Icon: Linkedin, label: 'LinkedIn' },
  ].filter(x => x.url);

  return (
    <footer className="relative bg-[hsl(var(--sherif-blue-deep))] text-background overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-[0.05]" />
      <div className="container relative py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img src={logoUrl} alt={nameAr} className="h-12 w-12 object-contain bg-background/5 rounded-xl p-1" />
              <div>
                <h3 className="text-sm font-extrabold tracking-tight">{nameAr}</h3>
                <p className="text-[11px] text-background/60">{tagline}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-background/70">{about}</p>
            {socials.length > 0 && (
              <div className="mt-5 flex items-center gap-2">
                {socials.map(({ url, Icon, label }) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-background/15 text-background/70 hover:bg-background/10 hover:text-background transition-colors">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-background/50">روابط سريعة</h3>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-background/75 hover:text-background transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-background/50">تواصل معنا</h3>
            <div className="space-y-3">
              <a href={`tel:${phone1}`} className="flex items-start gap-2 text-sm text-background/75 hover:text-background transition-colors">
                <Phone className="h-4 w-4 mt-0.5" />
                <span className="flex flex-col"><span className="text-[11px] text-background/50">{phone1Label}</span><span dir="ltr" className="font-semibold">{phone1}</span></span>
              </a>
              <a href={`tel:${phone2}`} className="flex items-start gap-2 text-sm text-background/75 hover:text-background transition-colors">
                <Phone className="h-4 w-4 mt-0.5" />
                <span className="flex flex-col"><span className="text-[11px] text-background/50">{phone2Label}</span><span dir="ltr" className="font-semibold">{phone2}</span></span>
              </a>
              <a href={mapLink} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-sm text-background/75 hover:text-background transition-colors">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{address}{postal && <> · رمز بريدي {postal}</>}{plus && <> ({plus})</>}</span>
              </a>
              <p className="flex items-center gap-2 text-xs text-background/50"><Clock className="h-3.5 w-3.5" />{hours}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-background/50">طلب عرض سعر</h3>
            <p className="text-xs text-background/60 mb-4 leading-relaxed">
              تواصل الآن للحصول على استشارة فنية وعرض سعر مجاني لمشروعك.
            </p>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground shadow-button hover:-translate-y-0.5 transition-transform">
              <MessageCircle className="h-4 w-4" />طلب عرض سعر
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-6 sm:flex-row">
          <p className="text-xs text-background/50">© {new Date().getFullYear()} {nameAr} · جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-[11px] text-background/40 hover:text-background/70 transition-colors">سياسة الخصوصية</Link>
            <Link to="/terms" className="text-[11px] text-background/40 hover:text-background/70 transition-colors">الشروط والأحكام</Link>
            <Link to="/admin/login" className="text-[11px] text-background/30 hover:text-background/60 transition-colors">لوحة التحكم</Link>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex h-9 w-9 items-center justify-center rounded-full border border-background/15 text-background hover:bg-background/10 transition-colors" aria-label="العودة للأعلى">
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
