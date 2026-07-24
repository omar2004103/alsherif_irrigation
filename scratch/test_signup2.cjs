const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://udbyruwuffeecunmtcwm.supabase.co', 'sb_publishable_aBYxI-ZwDEQ6gDVn2Piwjw_jRAh4f8g');

async function testNewAdmin() {
  const email = `admin-${Date.now()}@alsherif.com`;
  console.log(`🔑 Creating & Authenticating New Admin User: ${email}...`);

  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email,
    password: '2004103OmarAdel@',
  });

  if (authErr) {
    console.error('❌ Sign Up Error:', authErr.message);
    return;
  }

  console.log('✅ Admin Registered & Session Active! User ID:', authData.user?.id);

  // 2. Insert Product
  const prodSlug = 'test-prod-' + Date.now();
  const { data: prodData, error: prodErr } = await supabase
    .from('products')
    .insert([
      {
        title: 'طلمبة غاطسة اختبارية أصلية',
        slug: prodSlug,
        description: 'وصف المنتج الاختباري',
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

  // 3. Storage Upload to 'product-images'
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
    console.log('🎉 SUCCESS! Image Stored in Supabase Storage! Public URL:', publicUrlData.publicUrl);
  }
}

testNewAdmin();
