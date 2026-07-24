import { motion } from 'framer-motion';
import { useFaqItems } from '@/hooks/useSupabaseData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQSection = () => {
  const { data: faqItems } = useFaqItems();

  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="mb-3 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">الأسئلة الشائعة</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">أسئلة متكررة</h2>
        </motion.div>
        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems?.map(item => (
              <AccordionItem key={item.id} value={item.id} className="rounded-xl border border-border bg-card px-6 shadow-card">
                <AccordionTrigger className="text-right text-sm font-semibold text-foreground hover:text-primary py-4">{item.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-4">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
