import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';

const TermsPage = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>الشروط والأحكام — آل شريف لنظم الري الحديث</title>
      <meta name="description" content="الشروط والأحكام العامة لاستخدام موقع آل شريف لنظم الري الحديث وخدماته." />
      <link rel="canonical" href="https://alsherif-irrigation.lovable.app/terms" />
    </Helmet>
    <Navbar />
    <main className="pt-28">
      <section className="bg-[hsl(var(--sherif-blue-deep))] py-16 text-primary-foreground">
        <div className="container">
          <p className="mb-3 text-xs font-bold tracking-[0.3em] text-primary-foreground/60">LEGAL</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">الشروط والأحكام</h1>
          <p className="mt-2 text-sm text-primary-foreground/60">آخر تحديث: يوليو 2026</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container max-w-3xl space-y-8 text-foreground">
          <div>
            <h2 className="mb-3 text-xl font-bold">1. قبول الشروط</h2>
            <p className="text-muted-foreground leading-relaxed">باستخدامك لموقع آل شريف لنظم الري الحديث فإنك توافق على الالتزام بهذه الشروط والأحكام.</p>
          </div>
          <div>
            <h2 className="mb-3 text-xl font-bold">2. طبيعة الموقع</h2>
            <p className="text-muted-foreground leading-relaxed">يقدم الموقع معلومات عن منتجاتنا وخدماتنا الهندسية، ويتيح تقديم طلبات عروض الأسعار. لا يتم البيع أو الدفع الإلكتروني عبر الموقع.</p>
          </div>
          <div>
            <h2 className="mb-3 text-xl font-bold">3. طلبات عروض الأسعار</h2>
            <p className="text-muted-foreground leading-relaxed">جميع الأسعار المقدمة عبر عروض الأسعار قابلة للتغيير حسب توفر المنتجات وحجم الطلب. يعتبر عرض السعر ساري المفعول للمدة المذكورة فيه فقط.</p>
          </div>
          <div>
            <h2 className="mb-3 text-xl font-bold">4. الملكية الفكرية</h2>
            <p className="text-muted-foreground leading-relaxed">جميع المحتويات والشعار والصور والنصوص مملوكة لشركة آل شريف. لا يجوز نسخها أو إعادة استخدامها بدون إذن كتابي مسبق.</p>
          </div>
          <div>
            <h2 className="mb-3 text-xl font-bold">5. حدود المسؤولية</h2>
            <p className="text-muted-foreground leading-relaxed">لا تتحمل الشركة أي مسؤولية عن أي أضرار غير مباشرة تنشأ عن استخدام الموقع أو الاعتماد على المحتوى المعروض دون استشارة فنية.</p>
          </div>
          <div>
            <h2 className="mb-3 text-xl font-bold">6. تعديل الشروط</h2>
            <p className="text-muted-foreground leading-relaxed">تحتفظ الشركة بالحق في تعديل هذه الشروط في أي وقت، ويسري التعديل فور نشره على الموقع.</p>
          </div>
          <div>
            <h2 className="mb-3 text-xl font-bold">7. القانون الحاكم</h2>
            <p className="text-muted-foreground leading-relaxed">تخضع هذه الشروط لقوانين جمهورية مصر العربية، وتختص المحاكم المصرية بالفصل في أي نزاع.</p>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    <FloatingActions />
  </div>
);

export default TermsPage;