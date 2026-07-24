require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  console.log('🔧 Fixing Storage Bucket & Column Names...');

  // 1. Create bucket via Supabase Client
  const { data: bucketData, error: bucketErr } = await supabase.storage.createBucket('media', {
    public: true,
    fileSizeLimit: 52428800,
  });

  if (bucketErr) {
    console.log('Bucket status:', bucketErr.message);
  } else {
    console.log('✅ Bucket "media" created successfully!');
  }

  // 2. Map camelCase column names to lower case or snake_case in schema if needed
  // Let's inspect column names of 'products' in PostgreSQL
  const columns = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'products';
  `);

  console.log('📋 Postgres "products" columns:', columns.map(c => c.column_name));

  await prisma.$disconnect();
}

run();
