import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useSupabaseData';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';

const ContactSection = () => {
  const { toast } = useToast();
  const { data: products } = useProducts();
  const { s } = useSiteSettings();
  const phone1 = s('phone1', '01111661177');
  const phone1Label = s('phone1_label', 'م. عادل الشريف — مدير الشركة');
  const phone2 = s('phone2', '01008028048');
  const phone2Label = s('phone2_label', 'م. عادل الشريف — مدير الشركة');
  const whatsapp = s('whatsapp', '201111661177');
  const address = s('address', 'الشعراوي، قطاع غرب النوبارية، مركز حوش عيسى، محافظة البحيرة، مصر');
  const postal = s('postal_code', '5820220');
  const plus = s('plus_code', 'P726+RV2');
  const hours = s('hours', 'السبت - الخميس: 9 صباحاً - 6 مساءً');
  const hoursOff = s('hours_off', 'الجمعة: إجازة');
  const mapEmbed = s('google_map_embed', 'https://www.google.com/maps?q=P726%2BRV2%20Al%20Shaarawy%20Hosh%20Eissa%20Beheira%20Egypt&output=embed');
  const mapLink = s('google_map_link', '#');
  const [form, setForm] = useState({ name: '', phone: '', email: '', product: '', message: '' });
  const [submitting, setSubmitting] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast({ title: 'خطأ', description: 'يرجى ملء الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('inquiries').insert({
      customer_name: form.name, phone: form.phone, email: form.email || null,
      message: form.message, source: 'website',
    });
    if (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء الإرسال', variant: 'destructive' });
    } else {
      toast({ title: 'تم الإرسال', description: 'تم إرسال رسالتك بنجاح وسنتواصل معك قريباً' });
      setForm({ name: '', phone: '', email: '', product: '', message: '' });
    }
    setSubmitting(false);
  };

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="mb-3 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">تواصل معنا</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">نحن هنا لمساعدتك</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">تواصل معنا للاستفسار عن المنتجات أو طلب عرض سعر</p>
        </motion.div>
        <div className="grid gap-8 lg:grid-cols-5">
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="lg:col-span-3 rounded-2xl border border-border bg-card p-8 shadow-card">
            <h3 className="mb-6 text-xl font-bold text-foreground">أرسل رسالتك</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">الاسم *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background py-3 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="اسمك الكامل" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">رقم الهاتف *</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background py-3 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="01xxxxxxxxx" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">البريد الإلكتروني</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background py-3 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="example@email.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">المنتج</label>
                <select value={form.product} onChange={e => setForm({ ...form, product: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background py-3 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">اختر منتج (اختياري)</option>
                  {products?.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-foreground">الرسالة *</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4}
                className="w-full rounded-xl border border-input bg-background py-3 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="اكتب رسالتك أو استفسارك هنا..." required />
            </div>
            <button type="submit" disabled={submitting}
              className="mt-5 flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-button hover:scale-105 transition-all disabled:opacity-50">
              <Send className="h-4 w-4" />{submitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
            </button>
          </motion.form>
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="mb-4 text-lg font-bold text-foreground">معلومات التواصل</h3>
              <div className="space-y-4">
                <a href={`tel:${phone1}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary"><Phone className="h-5 w-5" /></div>
                  <div><p className="font-semibold" dir="ltr">{phone1}</p><p className="text-xs text-muted-foreground">{phone1Label}</p></div>
                </a>
                <a href={`tel:${phone2}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary"><Phone className="h-5 w-5" /></div>
                  <div><p className="font-semibold" dir="ltr">{phone2}</p><p className="text-xs text-muted-foreground">{phone2Label}</p></div>
                </a>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-accent text-primary-foreground"><MessageCircle className="h-5 w-5" /></div>
                  <div><p className="font-semibold">واتساب</p><p className="text-xs text-muted-foreground">تواصل فوري</p></div>
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-3 mb-3"><Clock className="h-5 w-5 text-primary" /><h4 className="font-bold text-foreground">ساعات العمل</h4></div>
              <p className="text-sm text-muted-foreground">{hours}</p>
              {hoursOff && <p className="text-sm text-muted-foreground mt-1">{hoursOff}</p>}
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-3 mb-3"><MapPin className="h-5 w-5 text-primary" /><h4 className="font-bold text-foreground">عنوان الشركة</h4></div>
              <address className="not-italic text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {address}
                {postal && <><br /><span className="text-foreground font-semibold">رمز بريدي: {postal}</span></>}
                {plus && <> · <span dir="ltr">Plus Code: {plus}</span></>}
              </address>
              {mapEmbed && (
                <div className="mt-3 overflow-hidden rounded-xl border border-border">
                  <iframe
                    title="موقع الشركة على الخريطة"
                    src={mapEmbed}
                    className="h-48 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}

              {mapLink && (
                <a href={mapLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                  فتح الموقع في خرائط جوجل ↗
                </a>
              )}

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
