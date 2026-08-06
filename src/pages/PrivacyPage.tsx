import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';

const PrivacyPage = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>سياسة الخصوصية — آل شريف لنظم الري الحديث</title>
      <meta name="description" content="سياسة الخصوصية وحماية بيانات عملاء آل شريف لنظم الري الحديث." />
      <link rel="canonical" href="https://alsherif-irrigation.lovable.app/privacy" />
    </Helmet>
    <Navbar />
    <main className="pt-28">
      <section className="bg-[hsl(var(--sherif-blue-deep))] py-16 text-primary-foreground">
        <div className="container">
          <p className="mb-3 text-xs font-bold tracking-[0.3em] text-primary-foreground/60">LEGAL</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">سياسة الخصوصية</h1>
          <p className="mt-2 text-sm text-primary-foreground/60">آخر تحديث: يوليو 2026</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container max-w-3xl space-y-8 text-foreground">
          <div>
            <h2 className="mb-3 text-xl font-bold">1. المقدمة</h2>
            <p className="text-muted-foreground leading-relaxed">تحترم شركة آل شريف لنظم الري الحديث خصوصية زوارها وعملائها، وتلتزم بحماية أي بيانات شخصية يتم مشاركتها معنا عبر هذا الموقع.</p>
          </div>
          <div>
            <h2 className="mb-3 text-xl font-bold">2. البيانات التي نجمعها</h2>
            <ul className="list-disc pr-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>الاسم ورقم الهاتف والبريد الإلكتروني عند طلب عرض سعر أو التواصل معنا.</li>
              <li>معلومات المشروع (النوع، الموقع، المتطلبات) لتقديم استشارة دقيقة.</li>
              <li>بيانات الاستخدام العامة (نوع المتصفح، الصفحات المزارة) لتحسين تجربة الموقع.</li>
            </ul>
          </div>
          <div>
            <h2 className="mb-3 text-xl font-bold">3. كيفية استخدام البيانات</h2>
            <p className="text-muted-foreground leading-relaxed">نستخدم بياناتك للرد على استفساراتك، إعداد عروض الأسعار، وتقديم الدعم الفني. لا نبيع أو نشارك بياناتك مع أي طرف ثالث لأغراض تسويقية.</p>
          </div>
          <div>
            <h2 className="mb-3 text-xl font-bold">4. حماية البيانات</h2>
            <p className="text-muted-foreground leading-relaxed">نستخدم إجراءات أمان تقنية وتنظيمية لحماية بياناتك من الوصول غير المصرح به أو الإفصاح أو التغيير.</p>
          </div>
          <div>
            <h2 className="mb-3 text-xl font-bold">5. حقوقك</h2>
            <p className="text-muted-foreground leading-relaxed">يحق لك طلب الاطلاع على بياناتك أو تعديلها أو حذفها في أي وقت عبر التواصل معنا على الأرقام المعلنة.</p>
          </div>
          <div>
            <h2 className="mb-3 text-xl font-bold">6. ملفات تعريف الارتباط (Cookies)</h2>
            <p className="text-muted-foreground leading-relaxed">قد يستخدم الموقع ملفات تعريف الارتباط الأساسية لتحسين تجربتك. يمكنك تعطيلها من إعدادات متصفحك.</p>
          </div>
          <div>
            <h2 className="mb-3 text-xl font-bold">7. التواصل</h2>
            <p className="text-muted-foreground leading-relaxed">لأي استفسار حول سياسة الخصوصية، تواصل معنا على: <span dir="ltr">01111661177</span> أو <span dir="ltr">01008028048</span>.</p>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    <FloatingActions />
  </div>
);

export default PrivacyPage;