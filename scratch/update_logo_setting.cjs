require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateLogo() {
  console.log('🖼️ Updating logo_url in website_settings table...');

  try {
    await prisma.websiteSetting.upsert({
      where: { key: 'logo_url' },
      update: { value: '/logo.png' },
      create: {
        key: 'logo_url',
        value: '/logo.png',
        group: 'general',
        description: 'رابط الشعار الرسمي للشركة',
      },
    });
    console.log('✅ logo_url updated in PostgreSQL database!');
  } catch (e) {
    console.error('Error updating logo_url:', e.message);
  }

  await prisma.$disconnect();
}

updateLogo();
