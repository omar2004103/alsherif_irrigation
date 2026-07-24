require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPrismaDirect() {
  console.log('🔍 Testing Direct PostgreSQL Insert via Prisma...');

  try {
    const prodSlug = 'prisma-test-prod-' + Date.now();
    const newProd = await prisma.product.create({
      data: {
        title: 'طلمبة غاطسة عبر بـ Prisma',
        slug: prodSlug,
        description: 'منتج مضاف مباشرة إلى قاعدة البيانات',
        shortDescription: 'طلمبة غاطسة',
        isFeatured: true,
      },
    });
    console.log('🎉 SUCCESS! Product Inserted via Prisma into PostgreSQL! ID:', newProd.id);
  } catch (e) {
    console.error('❌ Prisma Insert Error:', e.message);
  }

  await prisma.$disconnect();
}

testPrismaDirect();
