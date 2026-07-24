import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import WhyUsSection from '@/components/WhyUsSection';
import CategoriesSection from '@/components/CategoriesSection';
import ProductsSection from '@/components/ProductsSection';
import ServicesSection from '@/components/ServicesSection';
import PartnersSection from '@/components/PartnersSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import LatestArticlesSection from '@/components/LatestArticlesSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <WhyUsSection />
        <CategoriesSection />
        <ProductsSection />
        <ServicesSection />
        <PartnersSection />
        <TestimonialsSection />
        <LatestArticlesSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default Index;
