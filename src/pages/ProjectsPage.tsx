import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ArrowLeft,
  CheckCircle2,
  Phone,
  MessageCircle,
  FileText,
  Layers,
  Wrench,
  Droplets,
  ShieldCheck,
  Compass,
  Cog,
  Maximize2,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import heroImg from '@/assets/hero-irrigation.jpg';
import {
  PROJECTS_DATA,
  PROJECT_CATEGORIES,
  ProjectItem,
  ProjectCategory
} from '@/data/projectsData';

const ProjectsPage = () => {
  const { s } = useSiteSettings();
  const phone1 = s('phone1', '01111661177');
  const whatsapp = s('whatsapp', '201111661177');
  const nameAr = s('company_name_ar', 'آل شريف لنظم الري الحديث');

  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'الكل'>('الكل');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [activeModalImageIndex, setActiveModalImageIndex] = useState(0);

  // Filter projects based on activeCategory
  const filteredProjects = activeCategory === 'الكل'
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter(p => p.category === activeCategory);

  const handleOpenModal = (project: ProjectItem) => {
    setSelectedProject(project);
    setActiveModalImageIndex(0);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
    setActiveModalImageIndex(0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Helmet>
        <title>مشروعاتنا الهندسية — {nameAr}</title>
        <meta
          name="description"
          content="استكشف سابقة أعمال ومشروعات شركة آل شريف لنظم الري الحديث: شبكات الري بالتنقيط والرش، محطات الفلترة والتسميد، وتوريد وتركيب خطوط المياه في مختلف محافظات مصر."
        />
        <meta name="keywords" content="مشاريع ري حديث, شبكات تنقيط, محطات فلترة مياه, ري بالرش, آل شريف, النوبارية, وادي النطرون" />
        <link rel="canonical" href="https://alsherif-irrigation.lovable.app/projects" />
        <meta property="og:title" content={`مشروعاتنا الهندسية — ${nameAr}`} />
        <meta
          property="og:description"
          content="خبرة هندسية على أرض الواقع: شبكات ري بالتنقيط والرش ومحطات فلترة متقدمة للمزارع والمشروعات الزراعية."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28">
        {/* Breadcrumb Bar */}
        <section className="border-b border-border/60 bg-muted/20 py-3">
          <div className="container">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground font-medium" aria-label="مسار التصفح">
              <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
              <ChevronRight className="h-3.5 w-3.5 rotate-180 text-muted-foreground/50" />
              <span className="text-foreground font-semibold">المشاريع الهندسية</span>
            </nav>
          </div>
        </section>

        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden bg-[hsl(var(--sherif-blue-deep))] text-primary-foreground py-16 sm:py-24">
          <div className="absolute inset-0 blueprint-grid opacity-[0.08]" />
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />

          <div className="container relative z-10">
            <div className="grid gap-12 lg:grid-cols-12 items-center">
              {/* Left Column: Heading & CTAs */}
              <div className="lg:col-span-7">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3.5 py-1 text-xs font-semibold text-primary-foreground/90 mb-5 backdrop-blur-sm">
                    <ShieldCheck className="h-4 w-4 text-secondary" />
                    <span>سابقة أعمال موثقة وخبرة هندسية متخصصة</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.25] mb-6">
                    مشروعاتنا..{' '}
                    <span className="text-secondary drop-shadow-sm">خبرة هندسية</span>{' '}
                    على أرض الواقع
                  </h1>

                  <p className="text-base sm:text-lg text-primary-foreground/80 leading-relaxed max-w-2xl mb-8">
                    نُصمم ونُنفّذ شبكات الري الحديث ومحطات الفلترة والتسميد المركزية للمزارع والمشروعات الزراعية الكبرى، مع ضمان أعلى معايير الكفاءة الهيدروليكية وتوفير استهلاك الطاقة والمياه.
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href="#projects-gallery"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3.5 text-sm font-bold text-secondary-foreground shadow-lg hover:bg-secondary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <span>استكشف مشروعاتنا</span>
                      <ArrowLeft className="h-4 w-4" />
                    </a>

                    <Link
                      to="/quote"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/25 bg-primary-foreground/10 px-6 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary-foreground/20 transition-all backdrop-blur-sm"
                    >
                      <FileText className="h-4 w-4" />
                      <span>اطلب عرض سعر لمشروعك</span>
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Hero Visual Showcase */}
              <div className="lg:col-span-5">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative rounded-2xl overflow-hidden border border-primary-foreground/20 shadow-2xl bg-black/20"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={heroImg}
                      alt="مشروع شبكة ري بالتنقيط نفذته شركة آل شريف"
                      className="h-full w-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--sherif-blue-deep))]/90 via-transparent to-transparent pointer-events-none" />

                  {/* Highlight pill inside hero photo */}
                  <div className="absolute bottom-4 inset-x-4 p-4 rounded-xl bg-card/90 backdrop-blur-md border border-border/50 text-foreground shadow-lg">
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-1">
                      <span className="flex items-center gap-1.5 text-primary">
                        <MapPin className="h-3.5 w-3.5" />
                        قطاع غرب النوبارية
                      </span>
                      <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px]">
                        تنفيذ هندسي معتمد
                      </span>
                    </div>
                    <p className="text-sm font-extrabold text-foreground line-clamp-1">
                      شبكات ري بالتنقيط ومحطات فلترة مركزية
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Quick Fact Badges Strip */}
            <div className="mt-14 pt-8 border-t border-primary-foreground/15 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-secondary">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary-foreground/70">دراسة وتصميم</p>
                  <p className="text-sm font-bold text-primary-foreground">مخططات هيدروليكية دقيقة</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-secondary">
                  <Droplets className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary-foreground/70">أنظمة الري</p>
                  <p className="text-sm font-bold text-primary-foreground">تنقيط ورش ومحطات متكاملة</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-secondary">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary-foreground/70">جودة الخامات</p>
                  <p className="text-sm font-bold text-primary-foreground">مواسير ومحابس معتمدة عالمياً</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-secondary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary-foreground/70">ضمان وأمان</p>
                  <p className="text-sm font-bold text-primary-foreground">اختبارات ضغط ودعم تشغيلي</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CATEGORIES FILTER BAR & PROJECT GALLERY */}
        <section id="projects-gallery" className="py-16 sm:py-24 bg-background">
          <div className="container">
            {/* Section Header */}
            <div className="mb-10 text-center max-w-3xl mx-auto">
              <span className="section-label">معرض الأعمال الميدانية</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                نماذج من أعمالنا ومشاريعنا المنفذة
              </h2>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
                تصفح مشروعات الري المختلفة المنفذة بأعلى جودة هندسية، مع إمكانية الاطلاع على المواصفات الفنية ونطاق العمل المنجز لكل مشروع.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-12 flex flex-wrap items-center justify-center gap-2">
              {PROJECT_CATEGORIES.map(category => {
                const count = category.id === 'الكل'
                  ? PROJECTS_DATA.length
                  : PROJECTS_DATA.filter(p => p.category === category.id).length;

                // Don't show category pills that have 0 projects
                if (count === 0) return null;

                const isActive = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[hsl(var(--sherif-blue-deep))] text-white shadow-md'
                        : 'bg-card border border-border/80 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <span>{category.label}</span>
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                        isActive
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Projects Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, idx) => (
                  <motion.article
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
                  >
                    {/* Project Card Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          // Graceful fallback if any remote image link fails
                          (e.target as HTMLImageElement).src = heroImg;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2">
                        <span className="rounded-lg bg-card/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-foreground border border-border/50 shadow-sm">
                          {project.category}
                        </span>
                        {project.featured && (
                          <span className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-extrabold text-secondary-foreground shadow-sm">
                            مشروع مميز
                          </span>
                        )}
                      </div>

                      {/* Location pill */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/60 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white">
                        <MapPin className="h-3.5 w-3.5 text-secondary" />
                        <span>{project.location}</span>
                      </div>
                    </div>

                    {/* Project Card Body */}
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors mb-2.5">
                        {project.title}
                      </h3>

                      <p className="text-xs font-semibold text-primary/90 mb-3 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 shrink-0" />
                        <span>{project.systemType}</span>
                      </p>

                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-5 flex-1">
                        {project.summary}
                      </p>

                      {/* Project Key Components Snippet */}
                      <div className="mb-5 border-t border-border/60 pt-3.5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/75 mb-2">
                          أبرز المكونات الهندسية:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {project.components.slice(0, 2).map((comp, cIdx) => (
                            <span
                              key={cIdx}
                              className="rounded-md bg-muted/60 px-2 py-1 text-[11px] text-foreground/80 line-clamp-1 border border-border/40"
                            >
                              {comp.split('(')[0]}
                            </span>
                          ))}
                          {project.components.length > 2 && (
                            <span className="rounded-md bg-muted/40 px-1.5 py-1 text-[11px] text-muted-foreground font-bold">
                              +{project.components.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Trigger Modal Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenModal(project)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span>عرض تفاصيل المشروع والصور</span>
                      </button>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-muted/10 p-8 max-w-lg mx-auto">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">لا توجد مشاريع في هذا التصنيف حالياً</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  يمكنك استعراض باقي التصنيفات أو عرض كافة المشروعات الهندسية المتاحة.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveCategory('الكل')}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  <span>عرض جميع المشروعات</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 3. ENGINEERING PROCESS & CAPABILITIES SECTION */}
        <section className="py-20 bg-muted/30 border-y border-border/60">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="section-label">منظومة العمل الهندسي</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                كيف نُدير ونُنفّذ مشروعات الري من الفكرة حتى التشغيل؟
              </h2>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
                نعتمد منهجية هندسية صارمة تضمن أعلى كفاءة مائية وضغط تشغيلي متوازن على كامل مساحة المزرعة.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
              {[
                {
                  step: '01',
                  title: 'المعاينة والدراسة',
                  desc: 'رفع مساحي، تحليل مصادر المياه (آبار أو بحاري)، دراسة نوع التربة والمحصول لحساب الاحتياج المائي بدقة.',
                  icon: Compass
                },
                {
                  step: '02',
                  title: 'التصميم الهيدروليكي',
                  desc: 'إعداد المخططات الهندسية، تحديد أقطار المواسير وتصرفات المضخات ومحابس التحكم لتفادي هبوط الضغط.',
                  icon: Cog
                },
                {
                  step: '03',
                  title: 'التوريد المعتمد',
                  desc: 'توفير خراطيم ومواسير ومحابس وفلاتر من ماركات عالمية ومحلية موثوقة ذات شهادات جودة واختبارات معتمدة.',
                  icon: ShieldCheck
                },
                {
                  step: '04',
                  title: 'التركيب الميداني',
                  desc: 'تنفيذ أعمال الحفر واللحامات الهيدروليكية وتمديد الخطوط تحت إشراف هندسي وفني متخصص.',
                  icon: Wrench
                },
                {
                  step: '05',
                  title: 'الاختبار والدعم',
                  desc: 'إجراء اختبارات الضغط الهيدروستاتيكي، معايرة تصرف النقاطات والرشاشات، ومتابعة الصيانة الدورية.',
                  icon: Droplets
                }
              ].map((stage, sIdx) => (
                <div
                  key={sIdx}
                  className="relative rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black tracking-widest text-primary/80">
                      STAGE {stage.step}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                      <stage.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                    {stage.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. CONVERSION & QUOTATION CTA SECTION */}
        <section className="py-20 bg-[hsl(var(--sherif-blue-deep))] text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 blueprint-grid opacity-[0.06]" />
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto rounded-3xl border border-primary-foreground/20 bg-primary-foreground/5 p-8 sm:p-12 backdrop-blur-md shadow-2xl text-center">
              <span className="inline-block rounded-full bg-secondary px-3.5 py-1 text-xs font-extrabold text-secondary-foreground mb-4">
                استشارة هندسية ودراسة فنية لمزرعتك
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4 leading-snug">
                هل تخطط لإنشاء شبكة ري جديدة أو تطوير شبكتك الحالية؟
              </h2>

              <p className="text-sm sm:text-base text-primary-foreground/80 max-w-2xl mx-auto mb-8 leading-relaxed">
                تواصل مع المهندس عادل الشريف وفريق الخبراء للحصول على دراسة فنية دقيقة وعرض سعر متكامل يشمل التصميم والتوريد والتنفيذ.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('السلام عليكم، أود استشارة هندسية بخصوص تنفيذ مشروع شبكة ري.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02]"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>تواصل عبر واتساب فوراً</span>
                </a>

                <a
                  href={`tel:${phone1}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/30 bg-primary-foreground/10 px-6 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary-foreground/20 transition-all backdrop-blur-sm"
                >
                  <Phone className="h-4 w-4" />
                  <span dir="ltr">{phone1}</span>
                </a>

                <Link
                  to="/quote"
                  className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3.5 text-sm font-bold text-secondary-foreground hover:bg-secondary/90 transition-all hover:scale-[1.02]"
                >
                  <FileText className="h-4 w-4" />
                  <span>طلب مقايسة وعرض سعر</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 5. PROJECT DETAILS MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm"
            onClick={handleCloseModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-project-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-8 text-foreground shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseModal}
                className="absolute top-5 left-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
                aria-label="إغلاق تفاصيل المشروع"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Modal Header */}
              <div className="mb-6 pr-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-md bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
                    {selectedProject.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {selectedProject.location}
                  </span>
                </div>
                <h2 id="modal-project-title" className="text-2xl sm:text-3xl font-extrabold text-foreground leading-snug">
                  {selectedProject.title}
                </h2>
              </div>

              {/* Image Gallery Showcase */}
              <div className="mb-6 space-y-3">
                {/* Active Large Image Display */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted border border-border">
                  <img
                    src={selectedProject.gallery[activeModalImageIndex] || selectedProject.coverImage}
                    alt={`${selectedProject.title} - صورة ${activeModalImageIndex + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = heroImg;
                    }}
                  />
                  <div className="absolute bottom-3 left-3 rounded-md bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white">
                    صورة {activeModalImageIndex + 1} من {selectedProject.gallery.length}
                  </div>
                </div>

                {/* Thumbnails Row */}
                {selectedProject.gallery.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {selectedProject.gallery.map((imgUrl, thumbIdx) => (
                      <button
                        key={thumbIdx}
                        type="button"
                        onClick={() => setActiveModalImageIndex(thumbIdx)}
                        className={`relative aspect-[16/10] w-20 sm:w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                          activeModalImageIndex === thumbIdx
                            ? 'border-primary ring-2 ring-primary/30 scale-105'
                            : 'border-border/60 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`معاينة ${thumbIdx + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = heroImg;
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Engineering System Specs */}
              <div className="grid gap-4 sm:grid-cols-2 rounded-2xl bg-muted/40 p-5 border border-border/60 mb-6">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                    النظام الهيدروليكي المنفذ:
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedProject.systemType}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                    الموقع والمحافظة:
                  </p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    {selectedProject.location}
                  </p>
                </div>
              </div>

              {/* Project Description */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  وصف المشروع والحل الهندسي:
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Scope of Work */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  نطاق العمل والتنفيذ الميداني:
                </h4>
                <ul className="space-y-2.5">
                  {selectedProject.scopeOfWork.map((step, stepIdx) => (
                    <li key={stepIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/85">
                      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        ✓
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Components List */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  المكونات والمستلزمات الموردة:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.components.map((comp, compIdx) => (
                    <span
                      key={compIdx}
                      className="rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-medium text-foreground shadow-sm"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal CTAs */}
              <div className="border-t border-border pt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`السلام عليكم، استفسار بخصوص مشروع: ${selectedProject.title} (${selectedProject.location})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>استفسر عن هذا المشروع واتساب</span>
                  </a>

                  <Link
                    to={`/quote?project=${selectedProject.id}&title=${encodeURIComponent(selectedProject.title)}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all"
                  >
                    <FileText className="h-4 w-4" />
                    <span>اطلب مقايسة مماثلة</span>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-all"
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

export default ProjectsPage;
