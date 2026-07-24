require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  console.log('Applying RLS policies and Storage bucket fixes to Supabase PostgreSQL...');

  // 1. Create Storage bucket
  try {
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('media', 'media', true)
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);
    console.log('✅ Storage bucket "media" created/verified.');
  } catch (e) {
    console.error('Storage bucket error:', e.message);
  }

  // 2. Storage Objects Policies
  const storagePolicies = [
    `DROP POLICY IF EXISTS "Public Read media storage" ON storage.objects;`,
    `CREATE POLICY "Public Read media storage" ON storage.objects FOR SELECT USING (bucket_id = 'media');`,
    `DROP POLICY IF EXISTS "Public Upload media storage" ON storage.objects;`,
    `CREATE POLICY "Public Upload media storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');`,
    `DROP POLICY IF EXISTS "Public Update media storage" ON storage.objects;`,
    `CREATE POLICY "Public Update media storage" ON storage.objects FOR UPDATE USING (bucket_id = 'media');`,
    `DROP POLICY IF EXISTS "Public Delete media storage" ON storage.objects;`,
    `CREATE POLICY "Public Delete media storage" ON storage.objects FOR DELETE USING (bucket_id = 'media');`
  ];

  for (const pol of storagePolicies) {
    try { await prisma.$executeRawUnsafe(pol); } catch(e) { console.error('Storage policy error:', e.message); }
  }

  // 3. Table Policies
  const tables = ['products', 'product_variants', 'categories', 'brands', 'product_images', 'product_specifications', 'media_library', 'activity_logs', 'contact_messages', 'quote_requests', 'services', 'articles', 'website_settings', 'homepage_contents', 'seo_settings', 'footer_contents'];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Allow All on ${table}" ON "${table}";`);
      await prisma.$executeRawUnsafe(`CREATE POLICY "Allow All on ${table}" ON "${table}" FOR ALL USING (true) WITH CHECK (true);`);
      console.log(`✅ Permissive RLS policy applied to table: ${table}`);
    } catch(e) {
      console.error(`Policy error on ${table}:`, e.message);
    }
  }

  console.log('🎉 Fixes applied successfully!');
  await prisma.$disconnect();
}

fix();
