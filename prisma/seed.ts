import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      description: 'Full system access and administration permissions.',
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'Editor' },
    update: {},
    create: {
      name: 'Editor',
      description: 'Can edit products, categories, articles, and content.',
    },
  });

  console.log('✅ Roles created:', { superAdminRole: superAdminRole.name, editorRole: editorRole.name });

  // 2. Create Admin User
  const adminUser = await prisma.adminUser.upsert({
    where: { email: 'admin@alsherif.com' },
    update: {
      roleId: superAdminRole.id,
    },
    create: {
      email: 'admin@alsherif.com',
      username: 'admin',
      fullName: 'مدير النظام - الشريف لشبكات الري',
      phone: '01028200048',
      roleId: superAdminRole.id,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // 3. Create Default Categories
  const defaultCategories = [
    { name: 'مصادر المياه', slug: 'water-sources', icon: '💧', order: 1, description: 'حلول تجهيز الآبار ومصادر المياه الزراعية' },
    { name: 'طلمبات', slug: 'pumps', icon: '⚙️', order: 2, description: 'طلمبات غاطسة وسطحية بأعلى كفاءة' },
    { name: 'خزانات مياه', slug: 'tanks', icon: '🏗️', order: 3, description: 'خزانات بولي إيثيلين معتمدة للتخزين' },
    { name: 'مواسير PVC', slug: 'pvc-pipes', icon: '🔧', order: 4, description: 'مواسير PVC عالية الجودة لمختلف الضغوط' },
    { name: 'مواسير بولي إيثيلين', slug: 'pe-pipes', icon: '🔩', order: 5, description: 'مواسير بولي إيثيلين مرنة لشبكات الري' },
    { name: 'خراطيم ري', slug: 'hoses', icon: '🌊', order: 6, description: 'خراطيم رئيسية ومفرعة توزيع مياه' },
    { name: 'وصلات ومحابس', slug: 'fittings', icon: '🔗', order: 7, description: 'وصلات وأكواع ومحابس تحكم بالضغط' },
    { name: 'خراطيم تنقيط', slug: 'drip-hoses', icon: '💦', order: 8, description: 'خراطيم تنقيط جي ار ومسطحة' },
    { name: 'نقاطات ومنظمات ضغط', slug: 'drippers', icon: '🌱', order: 9, description: 'نقاطات تعويض الضغط وحقن الأسمدة' },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  console.log('✅ Categories seeded successfully.');

  // 4. Create Default Website Settings
  const defaultSettings = [
    { key: 'site_title', value: 'الشريف لشبكات ومستلزمات الري الحديث', group: 'general', description: 'عنوان الموقع الرئيسي' },
    { key: 'phone1', value: '01111661177', group: 'contact', description: 'رقم الهاتف الرئيسي 1' },
    { key: 'phone2', value: '01122811500', group: 'contact', description: 'رقم الهاتف الرئيسي 2' },
    { key: 'admin_phone', value: '01028200048', group: 'contact', description: 'هاتف الإدارة والمشروعات' },
    { key: 'whatsapp', value: '201111661177', group: 'contact', description: 'رقم الواتساب الرسمي' },
    { key: 'address', value: 'جمهورية مصر العربية', group: 'contact', description: 'العنوان الرئيسي' },
    { key: 'working_hours', value: 'السبت - الخميس: 9 صباحاً - 6 مساءً', group: 'contact', description: 'مواعيد العمل الرسمية' },
    { key: 'hero_title', value: 'حلول الري الحديث وتوريدات المياه', group: 'homepage', description: 'العنوان الرئيسي بالصفحة الأولى' },
    { key: 'hero_subtitle', value: 'نوفر لك أجود منتجات الري والمياه بأسعار تنافسية مع دعم فني متكامل للمزارع والمشاريع', group: 'homepage', description: 'الوصف الفرعي بالصفحة الأولى' },
  ];

  for (const setting of defaultSettings) {
    await prisma.websiteSetting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }

  console.log('✅ Website settings seeded successfully.');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
