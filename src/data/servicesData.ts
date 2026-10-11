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
  iconName: ServiceIconName;
  image_url?: string | null;
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
    iconName: 'ClipboardCheck',
    image_url: null,
  },
  {
    id: 'design',
    title: 'تصميم أنظمة الري',
    desc: 'تصميم مخططات هندسية دقيقة لشبكات الري بالتنقيط والرش والمحوري.',
    iconName: 'Cog',
    image_url: null,
  },
  {
    id: 'supply',
    title: 'التوريد',
    desc: 'توريد جميع مستلزمات الري من أفضل الماركات العالمية والمحلية.',
    iconName: 'Truck',
    image_url: null,
  },
  {
    id: 'installation',
    title: 'التركيب',
    desc: 'تركيب احترافي على يد فنيين متخصصين مع ضمان شامل على الأعمال.',
    iconName: 'Wrench',
    image_url: null,
  },
  {
    id: 'water-saving',
    title: 'ترشيد المياه',
    desc: 'حلول متقدمة لترشيد استهلاك المياه وزيادة كفاءة الري.',
    iconName: 'Droplets',
    image_url: null,
  },
  {
    id: 'automation',
    title: 'الأتمتة والتحكم',
    desc: 'أنظمة تحكم ذكية وأتمتة كاملة للتشغيل عن بُعد.',
    iconName: 'Zap',
    image_url: null,
  },
  {
    id: 'maintenance',
    title: 'الصيانة الدورية',
    desc: 'برامج صيانة دورية لضمان استمرارية عمل الشبكة بأعلى كفاءة.',
    iconName: 'Settings',
    image_url: null,
  },
  {
    id: 'support',
    title: 'الدعم الفني',
    desc: 'فريق دعم متاح للرد على استفساراتك وحل المشكلات فورًا.',
    iconName: 'Headphones',
    image_url: null,
  },
];
