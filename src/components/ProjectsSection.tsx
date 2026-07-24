import { motion } from 'framer-motion';
import { ArrowLeft, MapPin } from 'lucide-react';

const projects = [
  {
    title: 'مشروع ري بالتنقيط — مزرعة نخيل',
    location: 'الوادي الجديد',
    area: '450 فدان',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80',
  },
  {
    title: 'شبكة رشاشات محورية — قمح',
    location: 'المنيا',
    area: '820 فدان',
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&q=80',
  },
  {
    title: 'نظام ري لمشروع صوب زراعية',
    location: 'النوبارية',
    area: '120 فدان',
    image: 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=1200&q=80',
  },
];

const ProjectsSection = () => {
  return (
    <section id="projects" className="py-24 lg:py-32 bg-background">
      <div className="container">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="section-label">مشاريعنا</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
              مشاريع نفتخر بتنفيذها
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              نماذج حقيقية من مشاريعنا الميدانية في مختلف محافظات مصر — من الأراضي الصحراوية حتى الوادي.
            </p>
          </div>
          <a href="#contact" className="group hidden md:inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all">
            كل المشاريع <ArrowLeft className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <motion.article
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-500 hover:shadow-card-hover"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--sherif-blue-deep))]/90 via-[hsl(var(--sherif-blue-deep))]/20 to-transparent" />
                <span className="absolute top-4 right-4 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-secondary-foreground">
                  {p.area}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="flex items-center gap-1.5 text-xs text-background/80 mb-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.location}
                </div>
                <h3 className="text-lg font-bold text-background leading-snug">{p.title}</h3>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;