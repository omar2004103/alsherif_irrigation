require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reload() {
  console.log('Sending NOTIFY pgrst, reload schema to Supabase...');
  try {
    await prisma.$executeRawUnsafe(`NOTIFY pgrst, 'reload schema';`);
    console.log('✅ Schema cache reload notification sent to PostgREST!');
  } catch (e) {
    console.error('Notify error:', e.message);
  }

  // Reload storage buckets
  try {
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
      VALUES ('media', 'media', true, false, 52428800, NULL)
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);
    console.log('✅ Storage bucket "media" created in storage.buckets');
  } catch (e) {
    console.error('Bucket insert error:', e.message);
  }

  await prisma.$disconnect();
}

reload();
