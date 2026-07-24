import { useState, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Minus, Plus, Trash2, Package, Send, MessageCircle, FileText, Printer, CheckCircle2, Home, Upload, X, Lightbulb } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import { useQuoteCart, type QuoteItem } from '@/hooks/useQuoteCart';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CUSTOMER_TYPES = [
  { v: 'farmer', l: 'مزارع' },
  { v: 'agri_company', l: 'شركة زراعية' },
  { v: 'contractor', l: 'مقاول' },
  { v: 'dealer', l: 'موزّع/تاجر' },
  { v: 'distributor', l: 'موزّع رئيسي' },
  { v: 'landscape', l: 'شركة لاندسكيب' },
  { v: 'other', l: 'أخرى' },
];

const GOVERNORATES = [
  'القاهرة','الجيزة','الإسكندرية','القليوبية','المنوفية','الشرقية','الغربية','الدقهلية','دمياط','كفر الشيخ','البحيرة','الإسماعيلية','بورسعيد','السويس','شمال سيناء','جنوب سيناء','مطروح','الفيوم','بني سويف','المنيا','أسيوط','سوهاج','قنا','الأقصر','أسوان','البحر الأحمر','الوادي الجديد',
];

type FormState = {
  name: string; phone: string; whatsapp: string; email: string; company: string;
  customerType: string; governorate: string; city: string; projectLocation: string; notes: string;
};

const emptyForm: FormState = {
  name: '', phone: '', whatsapp: '', email: '', company: '',
  customerType: '', governorate: '', city: '', projectLocation: '', notes: '',
};

function buildMessage(form: FormState, items: QuoteItem[]) {
  const productsSummary = items.map((i) => `• ${i.title}${i.product_code ? ` (#${i.product_code})` : ''} — الكمية: ${i.quantity}`).join('\n');
  const custType = CUSTOMER_TYPES.find(c => c.v === form.customerType)?.l || form.customerType || '—';
  const lines = [
    'طلب عرض سعر:',
    '',
    productsSummary,
    '',
    '— بيانات العميل —',
    `الاسم: ${form.name}`,
    `الهاتف: ${form.phone}`,
    form.whatsapp ? `واتساب: ${form.whatsapp}` : null,
    form.email ? `البريد: ${form.email}` : null,
    form.company ? `الشركة: ${form.company}` : null,
    `نوع العميل: ${custType}`,
    `المحافظة: ${form.governorate || '—'}`,
    form.city ? `المدينة: ${form.city}` : null,
    form.projectLocation ? `موقع المشروع: ${form.projectLocation}` : null,
    form.notes ? `\nملاحظات:\n${form.notes}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

const inputCls = 'w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const labelCls = 'mb-1.5 block text-xs font-bold text-foreground';

const QuoteRequestPage = () => {
  const { items, count, remove, setQuantity, clear } = useQuoteCart();
  const [mode, setMode] = useState<'products' | 'project'>(items.length > 0 ? 'products' : 'project');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<null | { refId: string; snapshot: QuoteItem[]; form: FormState; at: string }>(null);
  const navigate = useNavigate();

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.customerType || !form.governorate) {
      toast.error('يرجى إكمال الحقول المطلوبة');
      return;
    }
    setSubmitting(true);
    const message = buildMessage(form, items);
    const { data, error } = await supabase.from('inquiries').insert({
      customer_name: form.name, phone: form.phone, email: form.email || null,
      whatsapp: form.whatsapp || null, customer_type: form.customerType || null,
      governorate: form.governorate || null, city: form.city || null,
      metadata: { items: items.map((i: any) => ({ id: i.id, title: i.title, code: i.product_code, qty: i.quantity })), notes: form.notes || null, company: form.company || null },
      message, source: 'quote_request',
    }).select('id').single();
    if (error) {
      toast.error('حدث خطأ أثناء الإرسال، حاول مرة أخرى');
      setSubmitting(false);
      return;
    }
    const refId = (data?.id as string || '').slice(0, 8).toUpperCase();
    setSuccess({ refId, snapshot: items, form, at: new Date().toLocaleString('ar-EG') });
    clear();
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappHref = useMemo(() => {
    if (!items.length) return '';
    const list = items.map((i) => `• ${i.title}${i.product_code ? ` (#${i.product_code})` : ''} — ${i.quantity}`).join('\n');
    return `https://wa.me/201028200048?text=${encodeURIComponent(`السلام عليكم، أرغب في عرض سعر للمنتجات التالية:\n\n${list}`)}`;
  }, [items]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>طلب عرض سعر — آل شريف لنظم الري الحديث</title>
        <meta name="description" content="أرسل طلب عرض سعر لمنتجات الري الحديث. سيتواصل معك فريق المبيعات خلال ساعات العمل." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <Navbar />
      <FloatingActions />

      {success ? (
        <SuccessView data={success} onBack={() => navigate('/products')} onHome={() => navigate('/')} />
      ) : (
      <>
      <section className="border-b border-border bg-card pt-28 pb-8 print:hidden">
        <div className="container">
          <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">الرئيسية</Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">طلب عرض سعر</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">طلب عرض سعر</h1>
          <p className="mt-2 text-muted-foreground">
            اختر الطريقة المناسبة لك — إما طلب عرض سعر لمنتجات محددة، أو اشرح لنا احتياج مشروعك وسنقترح الحل المناسب.
          </p>

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background p-1 w-fit">
            <button
              onClick={() => setMode('products')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${mode === 'products' ? 'bg-primary text-primary-foreground shadow-button' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Package className="h-4 w-4" /> منتجات مختارة {count > 0 && <span className="rounded-full bg-white/25 px-1.5 text-[10px]">{count}</span>}
            </button>
            <button
              onClick={() => setMode('project')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${mode === 'project' ? 'bg-primary text-primary-foreground shadow-button' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Lightbulb className="h-4 w-4" /> مشروع / احتياج
            </button>
          </div>

          {mode === 'project' && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-secondary/30 bg-[hsl(115,43%,96%)] p-4 text-sm text-foreground max-w-3xl">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
              <p>لا تعرف المنتجات المناسبة؟ اشرح لنا احتياجك، وسيقوم فريقنا باقتراح الحل المناسب وإرسال عرض سعر.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 print:hidden">
        <div className="container">
          {mode === 'project' ? (
            <ProjectInquiryForm onSuccess={(payload) => { setSuccess(payload); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          ) : items.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary">
                <FileText className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <h2 className="mb-2 text-lg font-bold text-foreground">قائمة الطلب فارغة</h2>
              <p className="mb-6 text-sm text-muted-foreground">تصفح منتجاتنا وأضف ما يهمك، أو استخدم طلب المشروع لوصف احتياجك.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link to="/products" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-button">
                  تصفح المنتجات <ChevronLeft className="h-4 w-4" />
                </Link>
                <button onClick={() => setMode('project')} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-bold text-foreground hover:bg-accent">
                  <Lightbulb className="h-4 w-4" /> طلب مشروع / احتياج
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
              <motion.div layout className="space-y-3">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
                  >
                    <Link to={`/product/${item.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-accent/30">
                      {item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> :
                        <div className="flex h-full items-center justify-center"><Package className="h-8 w-8 text-muted-foreground/30" /></div>}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link to={`/product/${item.slug}`} className="text-sm font-bold text-foreground hover:text-primary line-clamp-2">{item.title}</Link>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                        {item.brand && <span>الماركة: <span className="font-semibold text-foreground">{item.brand}</span></span>}
                        {item.product_code && <span dir="ltr">#{item.product_code}</span>}
                      </div>
                    </div>
                    <div className="inline-flex shrink-0 items-center rounded-lg border border-border">
                      <button onClick={() => setQuantity(item.id, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center text-foreground hover:bg-accent" aria-label="تقليل"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-10 text-center text-sm font-bold text-foreground tabular-nums">{item.quantity}</span>
                      <button onClick={() => setQuantity(item.id, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center text-foreground hover:bg-accent" aria-label="زيادة"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <button onClick={() => remove(item.id)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive" aria-label="إزالة">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
                <div className="flex justify-between pt-2">
                  <Link to="/products" className="text-sm font-bold text-primary hover:underline">← إضافة المزيد من المنتجات</Link>
                  <button onClick={clear} className="text-sm font-semibold text-muted-foreground hover:text-destructive">مسح الطلب</button>
                </div>
              </motion.div>

              <form onSubmit={handleSubmit} className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card lg:sticky lg:top-28">
                <h2 className="mb-1 text-lg font-extrabold text-foreground">بيانات العميل</h2>
                <p className="mb-5 text-xs text-muted-foreground">الحقول المميّزة بعلامة (*) مطلوبة.</p>

                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>الاسم بالكامل *</label>
                    <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>رقم الهاتف *</label>
                      <input type="tel" dir="ltr" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>واتساب</label>
                      <input type="tel" dir="ltr" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={inputCls} placeholder="اختياري" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>البريد الإلكتروني</label>
                    <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} placeholder="اختياري" />
                  </div>
                  <div>
                    <label className={labelCls}>اسم الشركة</label>
                    <input type="text" value={form.company} onChange={(e) => set('company', e.target.value)} className={inputCls} placeholder="اختياري" />
                  </div>
                  <div>
                    <label className={labelCls}>نوع العميل *</label>
                    <select value={form.customerType} onChange={(e) => set('customerType', e.target.value)} className={inputCls} required>
                      <option value="">— اختر —</option>
                      {CUSTOMER_TYPES.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>المحافظة *</label>
                      <select value={form.governorate} onChange={(e) => set('governorate', e.target.value)} className={inputCls} required>
                        <option value="">— اختر —</option>
                        {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>المدينة/المركز</label>
                      <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>موقع المشروع</label>
                    <input type="text" value={form.projectLocation} onChange={(e) => set('projectLocation', e.target.value)} className={inputCls} placeholder="اختياري" />
                  </div>
                  <div>
                    <label className={labelCls}>ملاحظات إضافية</label>
                    <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="مساحة المشروع، متطلبات خاصة..." />
                  </div>
                </div>

                <button type="submit" disabled={submitting}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-button transition-transform hover:-translate-y-0.5 disabled:opacity-60">
                  <Send className="h-4 w-4" /> {submitting ? 'جاري الإرسال...' : 'إرسال طلب عرض السعر'}
                </button>

                <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-secondary/30 bg-[hsl(115,43%,96%)] py-3 text-sm font-bold text-secondary hover:bg-secondary hover:text-secondary-foreground transition-colors">
                  <MessageCircle className="h-4 w-4" /> إرسال عبر واتساب مباشرة
                </a>
              </form>
            </div>
          )}
        </div>
      </section>
      </>
      )}

      <div className="print:hidden"><Footer /></div>
    </div>
  );
};

function SuccessView({ data, onBack, onHome }: { data: { refId: string; snapshot: QuoteItem[]; form: FormState; at: string }; onBack: () => void; onHome: () => void }) {
  const { refId, snapshot, form, at } = data;
  const custType = CUSTOMER_TYPES.find(c => c.v === form.customerType)?.l || '—';
  return (
    <>
      <section className="pt-28 pb-8 print:pt-8">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-border bg-card p-8 md:p-12 shadow-card text-center print:border-0 print:shadow-none">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/15 text-secondary print:hidden">
              <CheckCircle2 className="h-10 w-10" strokeWidth={1.8} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">تم استلام طلبك بنجاح</h1>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              شكرًا لك — فريق المبيعات في <span className="font-bold text-foreground">آل شريف لنظم الري الحديث</span> سيتواصل معك خلال ساعات العمل لمناقشة تفاصيل عرض السعر.
            </p>
            <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-border bg-accent/40 px-5 py-3">
              <span className="text-xs text-muted-foreground">رقم الطلب</span>
              <span dir="ltr" className="font-mono text-base font-bold text-primary">#{refId}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{at}</span>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-bold text-foreground hover:bg-accent">
                <Printer className="h-4 w-4" /> طباعة / حفظ PDF
              </button>
              <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-button">
                <Package className="h-4 w-4" /> متابعة تصفح المنتجات
              </button>
              <button onClick={onHome} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-bold text-foreground hover:bg-accent">
                <Home className="h-4 w-4" /> الرئيسية
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card print:shadow-none">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-extrabold text-foreground">ملخص الطلب</h2>
              <span dir="ltr" className="font-mono text-xs text-muted-foreground">#{refId}</span>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
              <Row k="الاسم" v={form.name} />
              <Row k="الهاتف" v={form.phone} ltr />
              {form.whatsapp && <Row k="واتساب" v={form.whatsapp} ltr />}
              {form.email && <Row k="البريد" v={form.email} ltr />}
              {form.company && <Row k="الشركة" v={form.company} />}
              <Row k="نوع العميل" v={custType} />
              <Row k="المحافظة" v={form.governorate || '—'} />
              {form.city && <Row k="المدينة" v={form.city} />}
              {form.projectLocation && <Row k="الموقع" v={form.projectLocation} />}
            </dl>

            {form.notes && (
              <div className="mt-4 rounded-xl bg-muted/40 p-4 text-sm text-foreground whitespace-pre-wrap">{form.notes}</div>
            )}

            <div className="mt-6 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-right text-sm">
                <thead className="bg-muted/50 text-xs font-bold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">المنتج</th>
                    <th className="px-4 py-2.5">الكود</th>
                    <th className="px-4 py-2.5">الكمية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {snapshot.map((i) => (
                    <tr key={i.id}>
                      <td className="px-4 py-3 font-semibold text-foreground">{i.title}{i.brand ? <span className="block text-xs text-muted-foreground">{i.brand}</span> : null}</td>
                      <td className="px-4 py-3 text-muted-foreground" dir="ltr">{i.product_code || '—'}</td>
                      <td className="px-4 py-3 font-bold text-foreground tabular-nums">{i.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ k, v, ltr }: { k: string; v: string; ltr?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="font-semibold text-foreground" dir={ltr ? 'ltr' : undefined}>{v}</dd>
    </div>
  );
}

export default QuoteRequestPage;

type ProjectFormState = {
  name: string; phone: string; whatsapp: string; email: string;
  governorate: string; city: string; customerType: string;
  projectType: string; area: string; cropType: string; description: string;
};

const PROJECT_TYPES = [
  { v: 'farm', l: 'مزرعة' },
  { v: 'landscape', l: 'لاندسكيب' },
  { v: 'company', l: 'شركة' },
  { v: 'other', l: 'أخرى' },
];

const emptyProject: ProjectFormState = {
  name: '', phone: '', whatsapp: '', email: '',
  governorate: '', city: '', customerType: '',
  projectType: '', area: '', cropType: '', description: '',
};

function ProjectInquiryForm({ onSuccess }: { onSuccess: (p: { refId: string; snapshot: QuoteItem[]; form: FormState; at: string }) => void }) {
  const [form, setForm] = useState<ProjectFormState>(emptyProject);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof ProjectFormState>(k: K, v: ProjectFormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    const valid = picked.filter((f) => f.size <= 10 * 1024 * 1024);
    if (picked.length !== valid.length) toast.error('حجم الملف الأقصى 10 ميجابايت');
    setFiles((prev) => [...prev, ...valid].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.governorate || !form.customerType || !form.projectType || !form.description.trim()) {
      toast.error('يرجى إكمال الحقول المطلوبة');
      return;
    }
    setSubmitting(true);

    const uploadedUrls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop() || 'bin';
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('inquiry-attachments').upload(path, file, { contentType: file.type });
      if (!upErr) uploadedUrls.push(path);
    }

    const projType = PROJECT_TYPES.find(p => p.v === form.projectType)?.l || form.projectType;
    const custType = CUSTOMER_TYPES.find(c => c.v === form.customerType)?.l || form.customerType;
    const lines = [
      'طلب عرض سعر لمشروع / احتياج:',
      '',
      '— بيانات العميل —',
      `الاسم: ${form.name}`,
      `الهاتف: ${form.phone}`,
      form.whatsapp ? `واتساب: ${form.whatsapp}` : null,
      form.email ? `البريد: ${form.email}` : null,
      `نوع العميل: ${custType}`,
      `المحافظة: ${form.governorate}`,
      form.city ? `المدينة: ${form.city}` : null,
      '',
      '— بيانات المشروع —',
      `نوع المشروع: ${projType}`,
      form.area ? `المساحة: ${form.area}` : null,
      form.cropType ? `نوع المحصول: ${form.cropType}` : null,
      '',
      'وصف الاحتياج:',
      form.description,
      uploadedUrls.length ? `\nالمرفقات (${uploadedUrls.length}):\n${uploadedUrls.map(u => `- ${u}`).join('\n')}` : null,
    ].filter(Boolean);
    const message = lines.join('\n');

    const { data, error } = await supabase.from('inquiries').insert({
      customer_name: form.name, phone: form.phone, email: form.email || null,
      whatsapp: form.whatsapp || null, customer_type: form.customerType || null,
      governorate: form.governorate || null, city: form.city || null,
      metadata: { project_type: form.projectType, area: form.area || null, crop: form.cropType || null, attachments: uploadedUrls },
      message, source: 'project_inquiry',
    }).select('id').single();

    if (error) {
      toast.error('حدث خطأ أثناء الإرسال، حاول مرة أخرى');
      setSubmitting(false);
      return;
    }

    const refId = (data?.id as string || '').slice(0, 8).toUpperCase();
    const compatForm: FormState = {
      name: form.name, phone: form.phone, whatsapp: form.whatsapp, email: form.email,
      company: '', customerType: form.customerType, governorate: form.governorate,
      city: form.city, projectLocation: '',
      notes: `نوع المشروع: ${projType}${form.area ? ` • المساحة: ${form.area}` : ''}${form.cropType ? ` • المحصول: ${form.cropType}` : ''}\n\n${form.description}${uploadedUrls.length ? `\n\nالمرفقات: ${uploadedUrls.length}` : ''}`,
    };
    onSuccess({ refId, snapshot: [], form: compatForm, at: new Date().toLocaleString('ar-EG') });
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
      <h2 className="mb-1 text-xl font-extrabold text-foreground">اشرح لنا احتياج مشروعك</h2>
      <p className="mb-6 text-xs text-muted-foreground">الحقول المميّزة بعلامة (*) مطلوبة. سيقوم فريقنا الفني بمراجعة طلبك واقتراح الحل المناسب.</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelCls}>الاسم بالكامل *</label>
          <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>رقم الهاتف *</label>
          <input type="tel" dir="ltr" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>واتساب</label>
          <input type="tel" dir="ltr" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={inputCls} placeholder="اختياري" />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>البريد الإلكتروني</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} placeholder="اختياري" />
        </div>
        <div>
          <label className={labelCls}>المحافظة *</label>
          <select value={form.governorate} onChange={(e) => set('governorate', e.target.value)} className={inputCls} required>
            <option value="">— اختر —</option>
            {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>المدينة/المركز</label>
          <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>نوع العميل *</label>
          <select value={form.customerType} onChange={(e) => set('customerType', e.target.value)} className={inputCls} required>
            <option value="">— اختر —</option>
            {CUSTOMER_TYPES.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>نوع المشروع *</label>
          <select value={form.projectType} onChange={(e) => set('projectType', e.target.value)} className={inputCls} required>
            <option value="">— اختر —</option>
            {PROJECT_TYPES.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>المساحة</label>
          <input type="text" value={form.area} onChange={(e) => set('area', e.target.value)} className={inputCls} placeholder="مثال: 10 فدان (اختياري)" />
        </div>
        <div>
          <label className={labelCls}>نوع المحصول</label>
          <input type="text" value={form.cropType} onChange={(e) => set('cropType', e.target.value)} className={inputCls} placeholder="اختياري" />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>وصف الاحتياج بالتفصيل *</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={5} className={`${inputCls} resize-none`} placeholder="اشرح لنا احتياجك، نوع الأرض، مصدر المياه، ما تحتاج إلى تنفيذه..." required />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>مرفقات (صور أو PDF)</label>
          <div className="rounded-xl border-2 border-dashed border-border bg-background p-4">
            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" onChange={onPickFiles} className="hidden" id="project-files" />
            <label htmlFor="project-files" className="flex cursor-pointer flex-col items-center justify-center gap-2 py-4 text-center text-sm text-muted-foreground hover:text-primary">
              <Upload className="h-6 w-6" />
              <span className="font-bold">اختر ملفات أو اسحبها هنا</span>
              <span className="text-xs">الحد الأقصى 5 ملفات · 10 ميجابايت لكل ملف · صور أو PDF</span>
            </label>
            {files.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-accent/40 px-3 py-2 text-xs">
                    <span className="truncate font-semibold text-foreground">{f.name}</span>
                    <button type="button" onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} className="shrink-0 text-muted-foreground hover:text-destructive" aria-label="إزالة">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <button type="submit" disabled={submitting}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-button transition-transform hover:-translate-y-0.5 disabled:opacity-60">
        <Send className="h-4 w-4" /> {submitting ? 'جاري الإرسال...' : 'إرسال طلب عرض السعر'}
      </button>
    </form>
  );
}
