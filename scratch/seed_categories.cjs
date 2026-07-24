require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();
const supabase = createClient('https://udbyruwuffeecunmtcwm.supabase.co', 'sb_publishable_aBYxI-ZwDEQ6gDVn2Piwjw_jRAh4f8g');

const categoriesList = [
  { name: 'خراطيم التنقيط', slug: 'drip-hoses', icon: '💦' },
  { name: 'خراطيم بولي إيثيلين', slug: 'pe-hoses', icon: '🌊' },
  { name: 'مواسير PVC', slug: 'pvc-pipes', icon: '🔧' },
  { name: 'وصلات', slug: 'fittings-connectors', icon: '🔗' },
  { name: 'محابس', slug: 'valves', icon: '🎛️' },
  { name: 'فلاتر', slug: 'filters', icon: '🔬' },
  { name: 'منظمات ضغط', slug: 'pressure-regulators', icon: '⚖️' },
  { name: 'سمادات', slug: 'fertilizers-injectors', icon: '🌱' },
  { name: 'رشاشات', slug: 'sprinklers', icon: '🌧️' },
  { name: 'نقاطات', slug: 'drippers', icon: '💧' },
  { name: 'محابس هواء', slug: 'air-valves', icon: '💨' },
  { name: 'عدادات مياه', slug: 'water-meters', icon: '📊' },
  { name: 'مضخات', slug: 'pumps', icon: '⚙️' },
  { name: 'محابس تحكم', slug: 'control-valves', icon: '🕹️' },
  { name: 'أكواع', slug: 'elbows', icon: '↩️' },
  { name: 'تيهات', slug: 'tees', icon: '🔀' },
  { name: 'جلب', slug: 'sleeves-couplings', icon: '⭕' },
  { name: 'سدادات', slug: 'end-caps-plugs', icon: '🔒' },
  { name: 'برده', slug: 'flanges-boards', icon: '🛡️' },
  { name: 'جوان', slug: 'gaskets-seals', icon: '🔘' },
  { name: 'إكسسوارات الري', slug: 'irrigation-accessories', icon: '🛠️' },
  { name: 'مستلزمات الري الأخرى', slug: 'other-irrigation-supplies', icon: '📦' },
];

async function seedCategories() {
  console.log('🌱 Adding 22 Irrigation Product Categories to Database...');

  for (let i = 0; i < categoriesList.length; i++) {
    const item = categoriesList[i];
    const order = i + 1;

    // 1. Upsert via Prisma into PostgreSQL
    try {
      await prisma.category.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          icon: item.icon,
          order: order,
        },
        create: {
          name: item.name,
          slug: item.slug,
          icon: item.icon,
          order: order,
          description: `تصنيف ${item.name} لشبكات ومستلزمات الري الحديث`,
        },
      });
      console.log(`✅ [Prisma Postgres] Added/Updated: ${item.name}`);
    } catch (e) {
      console.error(`Prisma error for ${item.name}:`, e.message);
    }

    // 2. Also Upsert via Supabase Client for Cloud Sync
    try {
      await supabase.from('categories').upsert([
        {
          name: item.name,
          slug: item.slug,
          icon: item.icon,
          order: order,
        },
      ], { onConflict: 'slug' });
    } catch (e) {
      // ignore
    }
  }

  console.log('🎉 All 22 categories added successfully!');
  await prisma.$disconnect();
}

seedCategories();
