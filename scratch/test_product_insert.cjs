require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  console.log('🧪 Testing Product Insert & Storage Bucket Upload...');

  // 1. Insert Product
  const prodSlug = 'test-irrigation-pump-' + Date.now();
  const { data: prodData, error: prodErr } = await supabase
    .from('products')
    .insert([
      {
        title: 'طلمبة غاطسة اختبارية',
        slug: prodSlug,
        description: 'وصف طلمبة غاطسة اختبارية عالية الكفاءة',
        shortDescription: 'طلمبة غاطسة اختبارية',
        isFeatured: true,
      },
    ])
    .select()
    .single();

  if (prodErr) {
    console.error('❌ Product Insert Error:', prodErr);
  } else {
    console.log('✅ Product Insert Successful! ID:', prodData.id);
  }

  // 2. Storage Bucket Upload
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
    console.log('✅ Storage Upload Successful! Public URL:', publicUrlData.publicUrl);
  }
}

test();
