import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PROJECTS_DATA } from '@/data/projectsData';

const ProjectsSection = () => {
  const featuredProjects = PROJECTS_DATA.slice(0, 3);

  return (
    <section id="projects" className="py-24 lg:py-32 bg-background border-t border-border/50">
      <div className="container">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="section-label">مشروعاتنا</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
              خبرة هندسية على أرض الواقع
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
              نماذج من شبكات الري ومحطات الفلترة المنفذة بأعلى معايير الجودة الهندسية في مختلف المشروعات والمزارع.
            </p>
          </div>
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
          >
            استعراض كافة المشروعات <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={p.coverImage}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--sherif-blue-deep))]/90 via-[hsl(var(--sherif-blue-deep))]/30 to-transparent" />
                <span className="absolute top-4 right-4 rounded-full bg-secondary px-3 py-1 text-[11px] font-extrabold text-secondary-foreground shadow-sm">
                  {p.category}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="flex items-center gap-1.5 text-xs text-white/80 mb-2">
                  <MapPin className="h-3.5 w-3.5 text-secondary" />
                  <span>{p.location}</span>
                </div>
                <h3 className="text-lg font-bold text-white leading-snug mb-1">
                  {p.title}
                </h3>
                <p className="text-xs text-white/70 line-clamp-2">
                  {p.summary}
                </p>
                <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-semibold text-secondary">
                  <Link to="/projects" className="inline-flex items-center gap-1.5 hover:underline">
                    <span>تفاصيل المشروع الهندسية</span>
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;