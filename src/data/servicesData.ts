import {
  ClipboardCheck,
  Cog,
  Truck,
  Wrench,
  Droplets,
  Zap,
  Settings,
  Headphones,
  type LucideIcon,
} from 'lucide-react';

export type ServiceIconName =
  | 'ClipboardCheck'
  | 'Cog'
  | 'Truck'
  | 'Wrench'
  | 'Droplets'
  | 'Zap'
  | 'Settings'
  | 'Headphones';

export interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  detailed_description?: string | null;
  iconName: ServiceIconName;
  image_url?: string | null;
  gallery_images?: string[];
}

export const SERVICE_ICONS: Record<ServiceIconName, LucideIcon> = {
  ClipboardCheck,
  Cog,
  Truck,
  Wrench,
  Droplets,
  Zap,
  Settings,
  Headphones,
};

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'consulting',
    title: 'الاستشارات الهندسية',
    desc: 'دراسة التربة والمحصول والمناخ لتصميم نظام الري الأمثل لمشروعك.',
    detailed_description: 'تشمل خدمات الاستشارات الهندسية من شركة آل شريف إجراء المعاينة الميدانية الدقيقة للمزرعة، وتحليل ملوحة وخصائص التربة ومصادر مياه الري (مياه آبار ارتوازية أو ترع بحاري)، مع دراسة الطبوغرافيا وميول الأرض والمناخ لتحديد أنسب النظم الهيدروليكية واختيار معدات الري الكفيلة بتحقيق أعلى إنتاجية مع توفير المياه والطاقة.',
    iconName: 'ClipboardCheck',
    image_url: null,
    gallery_images: [],
  },
  {
    id: 'design',
    title: 'تصميم أنظمة الري',
    desc: 'تصميم مخططات هندسية دقيقة لشبكات الري بالتنقيط والرش والمحوري.',
    detailed_description: 'إعداد المخططات الهندسية والحسابات الهيدروليكية المتكاملة لشبكات الري بالتنقيط والرش والمحوري. يتضمن ذلك حساب أقطار الخطوط الرئيسية والفرعية، فواقد الاحتكاك، ضغوط التشغيل، وتوزيع القطاعات والمناوبات لضمان تجانس تصريف المياه على كامل مساحة المشروع.',
    iconName: 'Cog',
    image_url: null,
    gallery_images: [],
  },
  {
    id: 'supply',
    title: 'التوريد',
    desc: 'توريد جميع مستلزمات الري من أفضل الماركات العالمية والمحلية.',
    detailed_description: 'توريد معتمد وشامل لجميع مستلزمات شبكات الري ومحطات الضخ من أفضل المصانع والعلامات التجارية العالمية والمحلية، بما في ذلك مواسير الـ PVC والبولي إيثيلين HDPE، خراطيم التنقيط GR المعوضة للضغط، محابس التحكم، فلاتر الرمل والديسك، وأجهزة القياس.',
    iconName: 'Truck',
    image_url: null,
    gallery_images: [],
  },
  {
    id: 'installation',
    title: 'التركيب',
    desc: 'تركيب احترافي على يد فنيين متخصصين مع ضمان شامل على الأعمال.',
    detailed_description: 'تنفيذ وتركيب احترافي ميداني لكافة مكونات شبكة الري على يد فرق فنية وهندسية متخصصة ومجهزة بأحدث ماكينات اللحام الهيدروليكية، مع الالتزام التام بالمواصفات الهندسية ومناسيب الدفن وغرف المحابس والاختبارات الهيدروستاتيكية قبل التسليم.',
    iconName: 'Wrench',
    image_url: null,
    gallery_images: [],
  },
  {
    id: 'water-saving',
    title: 'ترشيد المياه',
    desc: 'حلول متقدمة لترشيد استهلاك المياه وزيادة كفاءة الري.',
    detailed_description: 'حلول هندسية وتقنية متقدمة لرفع كفاءة استخدام المياه وتقليل الفواقد بالبخر والتسرب العميق، مع تصميم دوائر ري موضعية ومعايرة تصرف النقاطات والرشاشات بما يتناسب تماماً مع الاحتياجات المائية الفعلية لكل محصول في مختلف مراحل نموه.',
    iconName: 'Droplets',
    image_url: null,
    gallery_images: [],
  },
  {
    id: 'automation',
    title: 'الأتمتة والتحكم',
    desc: 'أنظمة تحكم ذكية وأتمتة كاملة للتشغيل عن بُعد.',
    detailed_description: 'توريد وتركيب محابس هيدروليكية وكهربائية ووحدات تحكم ذكية للتشغيل الآلي والمبرمج لشبكات الري والتسميد عن بُعد، مما يوفر العمالة ويمنع أخطاء التشغيل ويضمن تطبيق المقننات المائية والسمادية بدقة فائقة على مدار الساعة.',
    iconName: 'Zap',
    image_url: null,
    gallery_images: [],
  },
  {
    id: 'maintenance',
    title: 'الصيانة الدورية',
    desc: 'برامج صيانة دورية لضمان استمرارية عمل الشبكة بأعلى كفاءة.',
    detailed_description: 'برامج صيانة وقائية وعلاجية شاملة لضمان استمرارية عمل الشبكة بأعلى كفاءة طوال الموسم الزراعي، تشمل غسيل وتطهير خطوط التنقيط، صيانة بطاريات الفلاتر الرملية والقرصية، فحص ومعايرة محابس الضغط وتصريف الهواء، وإصلاح أي تسريبات ميدانية.',
    iconName: 'Settings',
    image_url: null,
    gallery_images: [],
  },
  {
    id: 'support',
    title: 'الدعم الفني',
    desc: 'فريق دعم متاح للرد على استفساراتك وحل المشكلات فورًا.',
    detailed_description: 'فريق هندسي متخصص متاح دائماً لتقديم الدعم الفني والمتابعة الميدانية الدورية، وحل أي مشكلات طارئة في ضغوط المياه أو توزيع الشبكة، وتدريب المشغلين والعمال في المزرعة على أفضل ممارسات التشغيل والصيانة.',
    iconName: 'Headphones',
    image_url: null,
    gallery_images: [],
  },
];
