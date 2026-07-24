require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://bocmjzlzkqirdzsizvdz.supabase.co', 'sb_publishable_aBYxI-ZwDEQ6gDVn2Piwjw_jRAh4f8g');

async function testInsert() {
  console.log('🧪 Testing Insert into bocmjzlzkqirdzsizvdz with mapped keys...');

  const prodSlug = 'test-bocm-' + Date.now();
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        title: 'طلمبة ري زراعية أصلية',
        slug: prodSlug,
        description: 'وصف طلمبة الري الزراعية',
        short_description: 'طلمبة ري',
        is_featured: true,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('❌ Insert Error:', error);
  } else {
    console.log('🎉 SUCCESS! Inserted Product into Supabase PostgreSQL! ID:', data.id);
  }
}

testInsert();
