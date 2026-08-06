// Local data store for products, categories, FAQ, testimonials, settings
// This will be replaced with Supabase queries once Cloud is enabled

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  image_url?: string;
  featured: boolean;
  created_at: string;
}

export interface Inquiry {
  id: string;
  customer_name: string;
  phone: string;
  email?: string;
  product_id?: string;
  message: string;
  source: string;
  status: 'جديد' | 'جاري المتابعة' | 'تم الإغلاق';
  created_at: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface SiteSettings {
  phone1: string;
  phone2: string;
  admin_phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  hero_title: string;
  hero_subtitle: string;
}

export const siteSettings: SiteSettings = {
  phone1: '01111661177',
  phone2: '01008028048',
  admin_phone: '01111661177',
  whatsapp: '201111661177',
  address: 'مصر',
  hours: 'السبت - الخميس: 9 صباحاً - 6 مساءً',
  hero_title: 'حلول الري الحديث وتوريدات المياه',
  hero_subtitle: 'نوفر لك أجود منتجات الري والمياه بأسعار تنافسية مع دعم فني متكامل',
};

export const categories: Category[] = [
  { id: '1', name: 'مصادر المياه', slug: 'water-sources', icon: '💧', order: 1 },
  { id: '2', name: 'طلمبات', slug: 'pumps', icon: '⚙️', order: 2 },
  { id: '3', name: 'خزانات مياه', slug: 'tanks', icon: '🏗️', order: 3 },
  { id: '4', name: 'مواسير PVC', slug: 'pvc-pipes', icon: '🔧', order: 4 },
  { id: '5', name: 'مواسير بولي إيثيلين', slug: 'pe-pipes', icon: '🔩', order: 5 },
  { id: '6', name: 'خراطيم ري', slug: 'hoses', icon: '🌊', order: 6 },
  { id: '7', name: 'وصلات وكوع وتي ومحابس', slug: 'fittings', icon: '🔗', order: 7 },
  { id: '8', name: 'خراطيم تنقيط', slug: 'drip-hoses', icon: '💦', order: 8 },
  { id: '9', name: 'نقاطات', slug: 'drippers', icon: '🌱', order: 9 },
  { id: '10', name: 'منظمات ضغط', slug: 'regulators', icon: '🎛️', order: 10 },
  { id: '11', name: 'فلاتر', slug: 'filters', icon: '🔬', order: 11 },
  { id: '12', name: 'رشاشات', slug: 'sprinklers', icon: '🌧️', order: 12 },
  { id: '13', name: 'عدادات مياه', slug: 'meters', icon: '📊', order: 13 },
  { id: '14', name: 'صمامات أمان', slug: 'safety-valves', icon: '🛡️', order: 14 },
  { id: '15', name: 'أغطية نهايات الخطوط', slug: 'end-caps', icon: '🔒', order: 15 },
];

export const products: Product[] = [
  { id: '1', title: 'آبار مياه عميقة', slug: 'deep-wells', description: 'حفر وتجهيز آبار المياه العميقة بأحدث التقنيات لتوفير مصدر مياه موثوق للمزارع والمشاريع الزراعية', category_id: '1', featured: true, created_at: '2024-01-01' },
  { id: '2', title: 'طلمبة غاطسة 2 حصان', slug: 'submersible-pump-2hp', description: 'طلمبة غاطسة عالية الكفاءة بقدرة 2 حصان، مناسبة للآبار المتوسطة العمق مع ضمان شامل', category_id: '2', featured: true, created_at: '2024-01-02' },
  { id: '3', title: 'طلمبة سطحية 1 حصان', slug: 'surface-pump-1hp', description: 'طلمبة سطحية بقدرة 1 حصان لسحب المياه من الخزانات والمصادر السطحية بكفاءة عالية', category_id: '2', featured: false, created_at: '2024-01-03' },
  { id: '4', title: 'خزان مياه 1000 لتر', slug: 'tank-1000l', description: 'خزان مياه سعة 1000 لتر مصنوع من البولي إيثيلين عالي الجودة، مقاوم للأشعة فوق البنفسجية', category_id: '3', featured: true, created_at: '2024-01-04' },
  { id: '5', title: 'خزان مياه 2000 لتر', slug: 'tank-2000l', description: 'خزان مياه سعة 2000 لتر للمشاريع الكبيرة، متين ومقاوم للتآكل مع ضمان 10 سنوات', category_id: '3', featured: false, created_at: '2024-01-05' },
  { id: '6', title: 'مواسير PVC 6 بار', slug: 'pvc-6bar', description: 'مواسير PVC ضغط 6 بار بأقطار متعددة، مناسبة لشبكات الري والصرف الزراعي', category_id: '4', featured: true, created_at: '2024-01-06' },
  { id: '7', title: 'مواسير PVC 10 بار', slug: 'pvc-10bar', description: 'مواسير PVC ضغط 10 بار للاستخدامات الثقيلة وشبكات المياه عالية الضغط', category_id: '4', featured: false, created_at: '2024-01-07' },
  { id: '8', title: 'مواسير بولي إيثيلين PE', slug: 'pe-pipes', description: 'مواسير بولي إيثيلين مرنة وقوية لنقل المياه في المشاريع الزراعية بأقطار من 16 إلى 110 مم', category_id: '5', featured: true, created_at: '2024-01-08' },
  { id: '9', title: 'خراطيم ري رئيسية', slug: 'main-hoses', description: 'خراطيم ري رئيسية متينة لتوزيع المياه في الحقول بكفاءة عالية ومقاومة للضغط', category_id: '6', featured: false, created_at: '2024-01-09' },
  { id: '10', title: 'وصلات وأكواع PVC', slug: 'pvc-fittings', description: 'تشكيلة كاملة من وصلات وأكواع ومحابس PVC لجميع أقطار المواسير مع ضمان الجودة', category_id: '7', featured: true, created_at: '2024-01-10' },
  { id: '11', title: 'خراطيم تنقيط 16 مم', slug: 'drip-hose-16mm', description: 'خراطيم تنقيط قطر 16 مم بمسافات متعددة بين النقاطات، مثالية للزراعة المكثفة', category_id: '8', featured: true, created_at: '2024-01-11' },
  { id: '12', title: 'نقاطات تعويضية', slug: 'compensating-drippers', description: 'نقاطات تعويضية الضغط بتصريفات متعددة (2، 4، 8 لتر/ساعة) لري منتظم في جميع الظروف', category_id: '9', featured: true, created_at: '2024-01-12' },
  { id: '13', title: 'منظم ضغط 2 بار', slug: 'regulator-2bar', description: 'منظم ضغط 2 بار لتنظيم ضغط المياه في شبكات الري بالتنقيط وحماية المكونات', category_id: '10', featured: false, created_at: '2024-01-13' },
  { id: '14', title: 'فلتر شبكي 2 بوصة', slug: 'mesh-filter-2inch', description: 'فلتر شبكي 2 بوصة لتنقية المياه من الشوائب وحماية شبكة الري من الانسداد', category_id: '11', featured: true, created_at: '2024-01-14' },
  { id: '15', title: 'رشاش دوار 360 درجة', slug: 'rotary-sprinkler', description: 'رشاش دوار بزاوية 360 درجة لتغطية مساحات واسعة بري منتظم وفعال', category_id: '12', featured: true, created_at: '2024-01-15' },
  { id: '16', title: 'عداد مياه 1 بوصة', slug: 'water-meter-1inch', description: 'عداد مياه 1 بوصة لقياس استهلاك المياه بدقة عالية في المشاريع الزراعية', category_id: '13', featured: false, created_at: '2024-01-16' },
  { id: '17', title: 'صمام أمان 2 بوصة', slug: 'safety-valve-2inch', description: 'صمام أمان 2 بوصة لحماية شبكة الري من الضغط الزائد والمطرقة المائية', category_id: '14', featured: false, created_at: '2024-01-17' },
  { id: '18', title: 'أغطية نهايات خطوط 16 مم', slug: 'end-cap-16mm', description: 'أغطية نهايات خطوط الري قطر 16 مم لإحكام غلق نهايات خراطيم التنقيط', category_id: '15', featured: false, created_at: '2024-01-18' },
];

export const faqItems: FAQItem[] = [
  { id: '1', question: 'ما هي أنظمة الري المتاحة لديكم؟', answer: 'نوفر جميع أنظمة الري الحديث بما في ذلك الري بالتنقيط، الري بالرش، والري السطحي. كل نظام مصمم ليناسب طبيعة المحصول والتربة والمناخ.', order: 1 },
  { id: '2', question: 'هل توفرون خدمة التركيب والتصميم؟', answer: 'نعم، نقدم خدمة تصميم شبكات الري بالكامل وتركيبها على يد فنيين متخصصين مع ضمان شامل على التركيب.', order: 2 },
  { id: '3', question: 'ما هي مناطق التوصيل المتاحة؟', answer: 'نغطي جميع محافظات مصر مع خدمة توصيل سريعة. المناطق القريبة يتم التوصيل خلال 24-48 ساعة.', order: 3 },
  { id: '4', question: 'هل يمكنني طلب عرض سعر مخصص؟', answer: 'بالطبع! يمكنك طلب عرض سعر مخصص عبر الواتساب أو نموذج الاتصال وسنرد عليك خلال ساعات.', order: 4 },
  { id: '5', question: 'ما هي طرق الدفع المتاحة؟', answer: 'نقبل الدفع نقداً عند الاستلام، التحويل البنكي، والدفع الإلكتروني. كما نوفر خيارات تقسيط للمشاريع الكبيرة.', order: 5 },
  { id: '6', question: 'هل المنتجات عليها ضمان؟', answer: 'جميع منتجاتنا مضمونة ضد عيوب التصنيع. فترة الضمان تختلف حسب المنتج وتتراوح من سنة إلى 10 سنوات.', order: 6 },
];

export const testimonials: Testimonial[] = [
  { id: '1', name: 'م. أحمد السيد', role: 'مزارع - المنوفية', content: 'تعاملت مع شركة الشريف في تجهيز شبكة ري كاملة لمزرعتي. المنتجات ممتازة والأسعار منافسة جداً. أنصح بالتعامل معهم.', rating: 5 },
  { id: '2', name: 'م. محمد عبدالله', role: 'مهندس زراعي - الفيوم', content: 'خدمة ممتازة وسرعة في التوريد. طلبت كميات كبيرة من خراطيم التنقيط والنقاطات وكل شيء وصل في الموعد بجودة عالية.', rating: 5 },
  { id: '3', name: 'الحاج عبدالرحمن', role: 'صاحب مشتل - البحيرة', content: 'من أفضل الشركات اللي تعاملت معاها في مجال الري. دعم فني متميز ومتابعة بعد البيع. ربنا يبارك لهم.', rating: 5 },
  { id: '4', name: 'م. سارة حسن', role: 'مهندسة ري - الشرقية', content: 'منتجات عالية الجودة وفريق فني محترف. ساعدوني في تصميم شبكة ري متكاملة لمشروع زراعي كبير. شكراً جزيلاً.', rating: 4 },
];

export const getWhatsAppLink = (productName?: string) => {
  const phone = siteSettings.whatsapp;
  const message = productName
    ? `السلام عليكم، أريد الاستفسار عن منتج: ${productName}`
    : 'السلام عليكم، أريد الاستفسار عن منتجات الري';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const getCallLink = (number?: string) => {
  return `tel:${number || siteSettings.phone1}`;
};
