const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://udbyruwuffeecunmtcwm.supabase.co', 'sb_publishable_aBYxI-ZwDEQ6gDVn2Piwjw_jRAh4f8g');

async function testUdbyReal() {
  console.log('🧪 Testing Real Production Supabase Project (udbyruwuffeecunmtcwm)...');

  // 1. Insert product
  const prodSlug = 'test-prod-' + Date.now();
  const { data: prodData, error: prodErr } = await supabase
    .from('products')
    .insert([
      {
        title: 'طلمبة غاطسة جديدة اختباري',
        slug: prodSlug,
        description: 'طلمبة غاطسة اختبارية عالية الكفاءة',
        category_id: '4f095018-7931-4449-ae14-199b0def30f2',
        featured: false,
        availability: 'available',
      },
    ])
    .select()
    .single();

  if (prodErr) {
    console.error('❌ Insert Error:', prodErr);
  } else {
    console.log('🎉 SUCCESS! Product Inserted into PostgreSQL! ID:', prodData.id);
  }

  // 2. Storage Upload to 'product-images'
  const dummyBuffer = Buffer.from('fake image content');
  const fileName = `products/test-${Date.now()}.png`;
  const { data: uploadData, error: uploadErr } = await supabase.storage.from('product-images').upload(fileName, dummyBuffer, {
    contentType: 'image/png',
    upsert: true,
  });

  if (uploadErr) {
    console.error('❌ Storage Upload Error:', uploadErr);
  } else {
    const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);
    console.log('🎉 SUCCESS! Image Uploaded to Supabase Storage! Public URL:', publicUrlData.publicUrl);
  }
}

testUdbyReal();
