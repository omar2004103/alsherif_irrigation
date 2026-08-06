const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://udbyruwuffeecunmtcwm.supabase.co', 'sb_publishable_aBYxI-ZwDEQ6gDVn2Piwjw_jRAh4f8g');

async function updateContactsSupabase() {
  console.log('📞 Updating Contact Settings via Supabase Client...');

  const settingsToUpsert = [
    { key: 'phone1', value: '01111661177' },
    { key: 'phone1_label', value: 'م. عادل الشريف — مدير الشركة' },
    { key: 'phone2', value: '01008028048' },
    { key: 'phone2_label', value: 'م. عادل الشريف — مدير الشركة' },
    { key: 'whatsapp', value: '201111661177' },
    { key: 'admin_phone', value: '01111661177' },
  ];

  for (const s of settingsToUpsert) {
    const { data, error } = await supabase.from('site_settings').upsert([s], { onConflict: 'key' });
    if (error) {
      console.log(`Note for ${s.key}:`, error.message);
    } else {
      console.log(`✅ [Supabase] Upserted ${s.key} = ${s.value}`);
    }
  }

  console.log('🎉 Done updating Supabase settings!');
}

updateContactsSupabase();
