require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  console.log('🧪 Testing Fixed Product Insert & Storage Bucket Upload...');

  // 1. Create Storage bucket 'media' via raw SQL if not created
  try {
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('media', 'media', true)
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);
    console.log('✅ Storage bucket "media" verified.');
  } catch (e) {
    console.error('Bucket creation note:', e.message);
  }

  // 2. Insert Product using snake_case keys for Supabase REST API
  const prodSlug = 'test-irrigation-pump-' + Date.now();
  const { data: prodData, error: prodErr } = await supabase
    .from('products')
    .insert([
      {
        title: 'طلمبة غاطسة اختبارية',
        slug: prodSlug,
        description: 'وصف طلمبة غاطسة اختبارية عالية الكفاءة',
        short_description: 'طلمبة غاطسة اختبارية',
        is_featured: true,
      },
    ])
    .select()
    .single();

  if (prodErr) {
    console.error('❌ Product Insert Error:', prodErr);
  } else {
    console.log('🎉 SUCCESS! Product Inserted into PostgreSQL! ID:', prodData.id);
  }

  // 3. Test Storage Upload
  const dummyBuffer = Buffer.from('fake image content');
  const fileName = `products/test-${Date.now()}.png`;
  const { data: uploadData, error: uploadErr } = await supabase.storage.from('media').upload(fileName, dummyBuffer, {
    contentType: 'image/png',
    upsert: true,
  });

  if (uploadErr) {
    console.error('❌ Storage Upload Error:', uploadErr);
  } else {
    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(uploadData.path);
    console.log('🎉 SUCCESS! Image Stored in Supabase Storage! URL:', publicUrlData.publicUrl);
  }

  await prisma.$disconnect();
}

test();
