require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateContacts() {
  console.log('📞 Updating Contact Phone & WhatsApp Numbers in PostgreSQL database...');

  const settingsToUpsert = [
    { key: 'phone1', value: '01111661177', description: 'رقم هاتف م. عادل الشريف' },
    { key: 'phone1_label', value: 'م. عادل الشريف — مدير الشركة', description: 'وصف رقم هاتف 1' },
    { key: 'phone2', value: '01008028048', description: 'رقم هاتف م. عادل الشريف إضافي' },
    { key: 'phone2_label', value: 'م. عادل الشريف — مدير الشركة', description: 'وصف رقم هاتف 2' },
    { key: 'whatsapp', value: '201111661177', description: 'رقم واتساب الرسمي' },
    { key: 'admin_phone', value: '01111661177', description: 'رقم هاتف الأدمن' },
  ];

  for (const s of settingsToUpsert) {
    try {
      await prisma.websiteSetting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: {
          key: s.key,
          value: s.value,
          group: 'contact',
          description: s.description,
        },
      });
      console.log(`✅ Updated ${s.key} = ${s.value}`);
    } catch (e) {
      console.error(`Error updating ${s.key}:`, e.message);
    }
  }

  await prisma.$disconnect();
}

updateContacts();
