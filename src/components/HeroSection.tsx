import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, FileText, ShieldCheck, Droplets, Sprout } from 'lucide-react';
import heroImg from '@/assets/hero-irrigation.jpg';
import logoAsset from '@/assets/al-sherif-logo.png.asset.json';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const HeroSection = () => {
  const { s } = useSiteSettings();
  const logoUrl = s('logo_url') || logoAsset.url;
  const nameEn = s('company_name_en', 'Al Sherif');
  const heroBadge = s('hero_badge', 'الشريك الهندسي لمشاريع الري في مصر');
  const heroTitle = s('hero_title', 'نُصمّم أنظمة الري');
  const heroTitleAccent = s('hero_title_accent', 'لأرضٍ أكثر إنتاجاً');
  const heroSubtitle = s('hero_subtitle', 'حلول متكاملة من الاستشارة الهندسية وحتى التركيب والصيانة — نخدم المزارعين وشركات المقاولات الزراعية والموزعين بأنظمة ري حديثة ومنتجات معتمدة عالمياً.');
  const whatsapp = s('whatsapp', '201028200048');
  const stats = [
    { k: 'سنوات الخبرة', v: s('stats_years', '+25') },
    { k: 'مشاريع منفذة', v: s('stats_projects', '+500') },
    { k: 'محافظات نغطيها', v: s('stats_governorates', '18') },
    { k: 'عملاء فعّالين', v: s('stats_clients', '+2,400') },
  ];

  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center overflow-hidden bg-[hsl(var(--sherif-blue-deep))]">
      <img
        src={heroImg}
        alt="نظام ري حديث بالتنقيط في حقول زراعية عند الغروب"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 gradient-hero-overlay" />
      <div className="absolute inset-0 bg-gradient-to-l from-[hsl(var(--sherif-blue-deep))]/85 via-[hsl(var(--sherif-blue-deep))]/55 to-transparent" />
      <div className="absolute inset-0 blueprint-grid opacity-[0.12] mix-blend-screen" />

      <div className="absolute top-28 left-6 hidden lg:flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-primary-foreground/60">
        <span>01</span>
        <span className="h-px w-10 bg-primary-foreground/40" />
        <span>HOME</span>
      </div>

      <div className="container relative z-10 py-24 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 flex items-center gap-3"
            >
              <img src={logoUrl} alt={nameEn} className="h-16 w-16 lg:h-20 lg:w-20 object-contain drop-shadow-2xl" />
              <div className="h-12 w-px bg-primary-foreground/25" />
              <div className="text-primary-foreground/85">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em]">{nameEn}</p>
                <p className="text-sm font-semibold">Modern Irrigation Systems</p>
              </div>

            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/[0.08] backdrop-blur-md px-4 py-1.5"
            >
              <Sprout className="h-3.5 w-3.5 text-[hsl(115,60%,70%)]" />
              <span className="text-xs font-semibold text-primary-foreground/90 tracking-wide">
                {heroBadge}
              </span>

            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6 text-4xl font-black leading-[1.05] text-primary-foreground sm:text-5xl lg:text-[64px] lg:leading-[1.02] tracking-tight"
            >
              {heroTitle}
              <br />
              <span className="text-gradient-leaf">{heroTitleAccent}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-9 max-w-2xl text-lg leading-relaxed text-primary-foreground/80 sm:text-xl"
            >
              {heroSubtitle}
            </motion.p>


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <a
                href="#products"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-6 py-3.5 text-sm font-bold text-primary shadow-hero transition-all duration-300 hover:-translate-y-0.5"
              >
                تصفح المنتجات
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </a>
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3.5 text-sm font-bold text-secondary-foreground shadow-button transition-all duration-300 hover:-translate-y-0.5"
              >
                <FileText className="h-4 w-4" />
                طلب عرض سعر
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/25 bg-primary-foreground/[0.06] backdrop-blur-md px-6 py-3.5 text-sm font-bold text-primary-foreground transition-all duration-300 hover:bg-primary-foreground/[0.12]"
              >
                <MessageCircle className="h-4 w-4" />
                واتساب
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-primary-foreground/70"
            >
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[hsl(115,60%,70%)]" /><span>ضمان شامل على التركيب</span></div>
              <div className="flex items-center gap-2"><Droplets className="h-4 w-4 text-[hsl(190,80%,70%)]" /><span>توفير حتى 60% من المياه</span></div>
              <div className="flex items-center gap-2"><Sprout className="h-4 w-4 text-[hsl(115,60%,70%)]" /><span>خبرة هندسية معتمدة</span></div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="hidden lg:block lg:col-span-4"
          >
            <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.06] backdrop-blur-xl p-6 shadow-hero">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary-foreground/60 mb-4">Company Data · 2026</p>
              <div className="space-y-4">
                {stats.map((row, i) => (

                  <div key={i} className="flex items-baseline justify-between border-b border-primary-foreground/10 pb-3 last:border-0 last:pb-0">
                    <span className="text-xs text-primary-foreground/70">{row.k}</span>
                    <span className="font-heading text-2xl font-extrabold text-primary-foreground">{row.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-primary-foreground/50">
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="h-8 w-px bg-primary-foreground/30 animate-pulse" />
      </div>
    </section>
  );
};

export default HeroSection;
