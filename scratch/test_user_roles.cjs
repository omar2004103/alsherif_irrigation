const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://udbyruwuffeecunmtcwm.supabase.co', 'sb_publishable_aBYxI-ZwDEQ6gDVn2Piwjw_jRAh4f8g');

async function testAdminRole() {
  console.log('🔑 Logging in user and testing user_roles table...');

  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin-1784891955644@alsherif.com',
    password: '2004103OmarAdel@',
  });

  if (authErr) {
    console.error('❌ Auth Error:', authErr.message);
    return;
  }

  const userId = authData.user.id;
  console.log('✅ Logged in! User ID:', userId);

  // 1. Insert into user_roles
  const { data: roleData, error: roleErr } = await supabase.from('user_roles').insert([
    {
      user_id: userId,
      role: 'admin',
    },
  ]);

  if (roleErr) {
    console.log('user_roles insert status:', roleErr.message);
  } else {
    console.log('✅ Added admin role to user_roles!');
  }

  // 2. Now Test Product Insert
  const prodSlug = 'test-prod-' + Date.now();
  const { data: prodData, error: prodErr } = await supabase
    .from('products')
    .insert([
      {
        title: 'طلمبة غاطسة اختبارية ناجحة 100%',
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

  // 3. Test Storage Upload to 'product-images'
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

testAdminRole();
