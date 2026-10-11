import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  X,
  MessageCircle,
  FileText,
  ChevronRight,
  Maximize2,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import { useServicesData } from '@/hooks/useServicesData';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { SERVICE_ICONS, ServiceItem } from '@/data/servicesData';

const ServicesPage = () => {
  const { services } = useServicesData();
  const { s } = useSiteSettings();
  const whatsapp = s('whatsapp', '201111661177');

  // Modal state for service details
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Helper to get all available images for modal gallery
  const getServiceGallery = (service: ServiceItem): string[] => {
    const list: string[] = [];
    if (service.image_url && service.image_url.trim()) {
      list.push(service.image_url.trim());
    }
    if (Array.isArray(service.gallery_images)) {
      service.gallery_images.forEach(img => {
        if (img && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    return list;
  };

  const handleOpenDetails = (service: ServiceItem) => {
    setSelectedService(service);
    setActiveImageIndex(0);
  };

  const handleCloseDetails = () => {
    setSelectedService(null);
    setActiveImageIndex(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>خدماتنا الهندسية — آل شريف لنظم الري الحديث</title>
        <meta
          name="description"
          content="استشارات، تصميم، توريد، تركيب، أتمتة، وصيانة أنظمة الري الحديث للمشاريع الزراعية."
        />
        <link rel="canonical" href="https://alsherif-irrigation.lovable.app/services" />
      </Helmet>

      <Navbar />

      <main className="pt-28">
        {/* Breadcrumbs */}
        <section className="border-b border-border/60 bg-muted/20 py-3">
          <div className="container">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground font-medium" aria-label="مسار التصفح">
              <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
              <ChevronRight className="h-3.5 w-3.5 rotate-180 text-muted-foreground/50" />
              <span className="text-foreground font-semibold">خدماتنا الهندسية</span>
            </nav>
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[hsl(var(--sherif-blue-deep))] py-20 text-primary-foreground">
          <div className="absolute inset-0 blueprint-grid opacity-[0.06]" />
          <div className="container relative">
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-primary-foreground/60">02 / SERVICES</p>
            <h1 className="max-w-3xl text-4xl font-extrabold sm:text-5xl">خدماتنا الهندسية</h1>
            <p className="mt-4 max-w-2xl text-primary-foreground/75 leading-relaxed">
              حزمة خدمات متكاملة من الاستشارة حتى الصيانة، لضمان نجاح مشروعك الزراعي بأعلى معايير الكفاءة الهيدروليكية.
            </p>
          </div>
        </section>

        {/* Services Grid Section */}
        <section className="py-20">
          <div className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => {
              const Icon = SERVICE_ICONS[s.iconName];
              const gallery = getServiceGallery(s);
              const hasDetailedView = Boolean(
                (s.detailed_description && s.detailed_description.trim()) || gallery.length > 0
              );

              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all overflow-hidden"
                >
                  {/* Optional Service Main Cover Image */}
                  {s.image_url && (
                    <div
                      className={`relative -mx-6 -mt-6 mb-5 aspect-[16/10] overflow-hidden bg-muted border-b border-border/60 ${
                        hasDetailedView ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => {
                        if (hasDetailedView) handleOpenDetails(s);
                      }}
                    >
                      <img
                        src={s.image_url}
                        alt={s.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).parentElement?.classList.add('hidden');
                        }}
                      />
                      {gallery.length > 1 && (
                        <div className="absolute bottom-2 left-2 rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          <span>{gallery.length} صور</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent text-primary-foreground shadow-sm">
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-foreground leading-snug">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.desc}</p>

                  {/* Optional Detail Link Button */}
                  {hasDetailedView && (
                    <div className="mt-4 pt-3 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(s)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:gap-2.5 transition-all"
                      >
                        <span>تفاصيل الخدمة والصور</span>
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-14">
              <p className="mb-3 text-xs font-bold tracking-[0.3em] text-primary/60">PROCESS</p>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">كيف نعمل معك</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-4">
              {[
                { n: '01', t: 'الاستشارة', d: 'نستمع لاحتياجاتك ونقيّم مشروعك.' },
                { n: '02', t: 'التصميم', d: 'نصمم الحل الأنسب مع دراسة كاملة.' },
                { n: '03', t: 'التنفيذ', d: 'توريد وتركيب بأعلى معايير الجودة.' },
                { n: '04', t: 'المتابعة', d: 'صيانة ودعم فني على المدى الطويل.' },
              ].map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card"
                >
                  <p className="text-3xl font-extrabold text-primary/20">{step.n}</p>
                  <h3 className="mt-2 text-lg font-bold text-foreground">{step.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20">
          <div className="container rounded-3xl bg-[hsl(var(--sherif-blue-deep))] p-10 text-center text-primary-foreground sm:p-14 relative overflow-hidden">
            <div className="absolute inset-0 blueprint-grid opacity-[0.06]" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold sm:text-4xl">ابدأ مشروعك اليوم</h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/75">
                فريقنا الهندسي جاهز لتحويل فكرتك إلى مشروع ناجح بدراسة فنية متكاملة.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  to="/quote"
                  className="rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground shadow-button hover:bg-secondary/90 transition-colors"
                >
                  طلب عرض سعر
                </Link>
                <Link
                  to="/contact"
                  className="rounded-xl border border-primary-foreground/25 bg-primary-foreground/5 px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-foreground/15 transition-colors"
                >
                  تواصل معنا
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Service Details Modal */}
      <AnimatePresence>
        {selectedService && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm"
            onClick={handleCloseDetails}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-8 text-foreground shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseDetails}
                className="absolute top-5 left-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3.5 mb-6 pr-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent text-primary-foreground shrink-0 shadow-sm">
                  {React.createElement(SERVICE_ICONS[selectedService.iconName], { className: 'h-6 w-6' })}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground">
                    {selectedService.title}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    خدمات آل شريف لنظم الري الحديث
                  </p>
                </div>
              </div>

              {/* Short Description */}
              <div className="rounded-2xl bg-muted/30 p-4 border border-border/60 mb-6">
                <p className="text-sm font-semibold text-foreground leading-relaxed">
                  {selectedService.desc}
                </p>
              </div>

              {/* Gallery Browser (if images exist) */}
              {(() => {
                const gallery = getServiceGallery(selectedService);
                if (gallery.length === 0) return null;

                const currentImage = gallery[activeImageIndex] || gallery[0];

                return (
                  <div className="mb-6 space-y-3">
                    {/* Main Image View */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted border border-border">
                      <img
                        src={currentImage}
                        alt={`${selectedService.title} - صورة ${activeImageIndex + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-2.5 left-2.5 rounded-md bg-black/65 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white">
                        صورة {activeImageIndex + 1} من {gallery.length}
                      </div>
                    </div>

                    {/* Thumbnails Row */}
                    {gallery.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {gallery.map((imgUrl, thumbIdx) => (
                          <button
                            key={thumbIdx}
                            type="button"
                            onClick={() => setActiveImageIndex(thumbIdx)}
                            className={`relative aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                              activeImageIndex === thumbIdx
                                ? 'border-primary ring-2 ring-primary/30 scale-105'
                                : 'border-border/60 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`معاينة ${thumbIdx + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Detailed Description (if present) */}
              {selectedService.detailed_description && selectedService.detailed_description.trim() && (
                <div className="mb-6 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>تفاصيل الخدمة ونطاق العمل الهندسـي:</span>
                  </h4>
                  <div className="rounded-2xl border border-border/80 bg-card p-4 text-xs sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                    {selectedService.detailed_description}
                  </div>
                </div>
              )}

              {/* Action CTAs */}
              <div className="border-t border-border pt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                      `السلام عليكم، أود الاستفسار عن خدمة: ${selectedService.title}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>استفسر عبر واتساب</span>
                  </a>

                  <Link
                    to={`/quote?service=${selectedService.id}&title=${encodeURIComponent(
                      selectedService.title
                    )}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all"
                  >
                    <FileText className="h-4 w-4" />
                    <span>طلب عرض سعر</span>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <FloatingActions />
    </div>
  );
};

export default ServicesPage;