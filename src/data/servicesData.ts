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
    detailed_description: null,
    iconName: 'ClipboardCheck',
    image_url: null,
    gallery_images: [],
  },
  {
    id: 'design',
    title: 'تصميم أنظمة الري',
    desc: 'تصميم مخططات هندسية دقيقة لشبكات الري بالتنقيط والرش والمحوري.',
    detailed_description: null,
    iconName: 'Cog',
    image_url: null,
    gallery_images: [],
  },
  {
    id: 'supply',
    title: 'التوريد',
    desc: 'توريد جميع مستلزمات الري من أفضل الماركات العالمية والمحلية.',
    detailed_description: null,
    iconName: 'Truck',
    image_url: null,
    gallery_images: [],
  },
  {
    id: 'installation',
    title: 'التركيب',
    desc: 'تركيب احترافي على يد فنيين متخصصين مع ضمان شامل على الأعمال.',
    detailed_description: null,
    iconName: 'Wrench',
    image_url: null,
    gallery_images: [],
  },
  {
    id: 'water-saving',
    title: 'ترشيد المياه',
    desc: 'حلول متقدمة لترشيد استهلاك المياه وزيادة كفاءة الري.',
    detailed_description: null,
    iconName: 'Droplets',
    image_url: null,
    gallery_images: [],
  },
  {
    id: 'automation',
    title: 'الأتمتة والتحكم',
    desc: 'أنظمة تحكم ذكية وأتمتة كاملة للتشغيل عن بُعد.',
    detailed_description: null,
    iconName: 'Zap',
    image_url: null,
    gallery_images: [],
  },
  {
    id: 'maintenance',
    title: 'الصيانة الدورية',
    desc: 'برامج صيانة دورية لضمان استمرارية عمل الشبكة بأعلى كفاءة.',
    detailed_description: null,
    iconName: 'Settings',
    image_url: null,
    gallery_images: [],
  },
  {
    id: 'support',
    title: 'الدعم الفني',
    desc: 'فريق دعم متاح للرد على استفساراتك وحل المشكلات فورًا.',
    detailed_description: null,
    iconName: 'Headphones',
    image_url: null,
    gallery_images: [],
  },
];
