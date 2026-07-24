import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import ContactSection from '@/components/ContactSection';

const ContactPage = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>تواصل معنا — آل شريف لنظم الري الحديث</title>
      <meta name="description" content="تواصل مع فريق آل شريف لنظم الري الحديث للاستفسار أو طلب استشارة فنية." />
      <link rel="canonical" href="https://alsherif-irrigation.lovable.app/contact" />
    </Helmet>
    <Navbar />
    <main className="pt-28">
      <section className="relative overflow-hidden bg-[hsl(var(--sherif-blue-deep))] py-20 text-primary-foreground">
        <div className="absolute inset-0 blueprint-grid opacity-[0.06]" />
        <div className="container relative">
          <p className="mb-3 text-xs font-bold tracking-[0.3em] text-primary-foreground/60">03 / CONTACT</p>
          <h1 className="max-w-3xl text-4xl font-extrabold sm:text-5xl">تواصل معنا</h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/75 leading-relaxed">
            نحن هنا لخدمتك — تواصل معنا عبر الهاتف، الواتساب، أو نموذج الاتصال أدناه.
          </p>
        </div>
      </section>
      <ContactSection />
    </main>
    <Footer />
    <FloatingActions />
  </div>
);

export default ContactPage;