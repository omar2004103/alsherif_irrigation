const { PrismaClient } = require('@prisma/client');

const regions = [
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-me-central-1.pooler.supabase.com',
];

async function findRegion() {
  console.log('🔍 Testing Supabase PostgreSQL pooler regions for udbyruwuffeecunmtcwm...');

  for (const region of regions) {
    const url = `postgresql://postgres.udbyruwuffeecunmtcwm:2004103OmarAdel%40@${region}:6543/postgres?pgbouncer=true`;
    console.log(`Testing ${region}...`);
    const p = new PrismaClient({ datasources: { db: { url } } });
    try {
      await p.$queryRawUnsafe('SELECT 1 as test');
      console.log(`🎉 SUCCESS! Connected to udbyruwuffeecunmtcwm on ${region}!`);
      await p.$disconnect();
      return region;
    } catch (e) {
      console.log(`Failed ${region}:`, e.message.split('\n')[0]);
    }
    await p.$disconnect();
  }
}

findRegion();
